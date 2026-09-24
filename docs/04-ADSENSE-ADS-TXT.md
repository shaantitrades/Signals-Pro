# 04 — AdSense : statut ads.txt « introuvable »

## Symptôme

Dans Google AdSense → **Sites** → `marketsignals24.com`, la colonne **ads.txt** affiche
**« Introuvable »** (ou *Not found*).

## 🔴 INCIDENT (constaté le 24/09/2026 à 18h20) — ✅ **RÉSOLU**

> **Mise à jour 24/09/2026 — RÉSOLU** après correction des domaines dans Coolify. Vérifications :
>
> | URL | Avant | Après |
> |---|---|---|
> | `https://marketsignals24.com/` | 503 | ✅ **200** |
> | `https://marketsignals24.com/ads.txt` | 503 | ✅ **200** |
> | `https://www.marketsignals24.com/` | 200 | ✅ **200** |
> | `https://www.marketsignals24.com/ads.txt` | 200 | ✅ **200** |
> | `https://marketsignals24.com/health` | 503 | ✅ **404** (engine non exposé) |
> | Certificats apex + `www` | — | ✅ tous deux valides |
>
> ➜ Il reste à faire dans AdSense : **Sites → Vérifier les mises à jour**.
>
> *Note* : `www` sert encore le site en direct (200) au lieu de rediriger vers l'apex, car la
> redirection `next.config.js` n'était pas encore déployée. Il faut soit redéployer le
> frontend avec la modification, soit laisser Coolify s'en charger.

### État constaté lors de l'incident (archive)

Le site était alors dans l'état suivant, **persistant après plusieurs minutes de tests** :

| URL | État | Certificat |
|---|---|---|
| `https://marketsignals24.com/` | 🔴 **503 Service Unavailable** (corps vide, `text/plain`) | ✅ `CN=marketsignals24.com` |
| `https://www.marketsignals24.com/` | ✅ **200 OK** | ✅ `CN=www.marketsignals24.com` |
| `https://api.marketsignals24.com/api/health` | ✅ 200 | ✅ |

Le DNS est sain (les deux hôtes résolvent vers `95.111.230.185`) et les **deux certificats
sont valides** : le problème n'est ni DNS ni SSL, c'est du **routage Traefik**.

Un `503` avec corps vide renvoyé par Traefik signifie : *le routeur existe, mais le service
vers lequel il pointe n'a aucun backend sain*. Comme le **frontend répond parfaitement sur
`www`**, cela prouve que **`marketsignals24.com` ne pointe plus vers le frontend** — il pointe
vraisemblablement encore vers `signal-engine` (actuellement arrêté/malsain).

Indice concordant : `https://api.marketsignals24.com/api/health` affichait un `uptime` de
**176 s** alors qu'il était de **154 815 s** trente minutes plus tôt → **le stack a été
redéployé entre-temps**.

### Pourquoi c'est directement lié à AdSense

L'URL indexée par Google est `https://marketsignals24.com` (**sans www**). Le crawler ads.txt
de Google appelle donc `https://marketsignals24.com/ads.txt` et reçoit maintenant **503**
→ statut **« introuvable »**.

### Correction immédiate

Dans **Coolify → `frontend` → Domains**, la liste **doit contenir les deux** :

```
https://marketsignals24.com
https://www.marketsignals24.com
```

Si `https://marketsignals24.com` a été **remplacé** par `https://www.marketsignals24.com`,
c'est la cause du 503 : remettez-le. Et vérifiez que **`signal-engine` n'a plus aucun domaine**
(sinon son routeur peut capter l'apex).

Contrôle après redéploiement :

```bash
curl -sI https://marketsignals24.com/ads.txt   # attendu : 200, text/plain
curl -sI https://www.marketsignals24.com/ads.txt
```

## Diagnostic effectué (vérifié sur la production le 24/09/2026)

| Test | Résultat |
|------|----------|
| `GET https://marketsignals24.com/ads.txt` | ✅ **200**, `Content-Type: text/plain`, contenu correct |
| `GET https://marketsignals24.com/ads.txt` avec UA `Googlebot` / `AdsBot-Google` | ✅ 200 (pas de blocage user-agent) |
| `GET https://www.marketsignals24.com/ads.txt` | ❌ **Échec SSL/TLS** — certificat auto-signé `CN=TRAEFIK DEFAULT CERT` |
| `GET http://www.marketsignals24.com/ads.txt` | ❌ **404** renvoyé par Traefik (aucun routeur pour l'hôte `www`) |
| Certificat apex | ✅ Let's Encrypt, `CN=marketsignals24.com` (ne couvre **pas** `www`) |
| Correspondance des IDs éditeur | ✅ `ads.txt` → `pub-5343389597650456` = `layout.tsx` → `ca-pub-5343389597650456` |
| `https://marketsignals24.com/health` (route FastAPI du signal-engine) | ⚠️ **404** → le *frontend* gagne le conflit Traefik **actuellement** |
| `https://api.marketsignals24.com/api/health` | ✅ 200 — `{"status":"healthy","version":"1.0.0",...}` |

### Conclusion

Le fichier `frontend/public/ads.txt` **n'est pas le problème** : il existe, il est commité
(`e22871e`) et il est bien servi par le conteneur Next.js en production.

Le problème est le **sous-domaine `www`** :

1. `www.marketsignals24.com` résout bien en DNS vers `95.111.230.185` (la même IP que l'apex).
2. Mais **Traefik (Coolify) n'a aucun routeur** pour cet hôte → réponse **404** en HTTP,
   et en HTTPS le client reçoit le **certificat par défaut auto-signé de Traefik**
   (`TRAEFIK DEFAULT CERT`), donc l'échange TLS échoue.
3. Le certificat Let's Encrypt valide ne couvre que `marketsignals24.com`.

Le crawler ads.txt de Google contrôle le domaine racine **et** le sous-domaine `www`. Comme
`www` ne répond pas de façon exploitable, le contrôle échoue → statut **« introuvable »**.

> Historique : `deploy.sh` (ancien déploiement Nginx + Certbot) demandait bien
> `-d ${DOMAIN} -d www.${DOMAIN}`. Le passage à **Coolify + Traefik** (commit `22a3baf`,
> « suppression des ports publiés, proxy Traefik via domaines ») a fait perdre la prise en
> charge de `www`.

## Deuxième problème (plus grave) : conflit de domaines dans Coolify

Configuration actuellement constatée dans Coolify :

| Service | Domaine(s) déclaré(s) | Correct ? |
|---------|----------------------|-----------|
| `backend` | `https://api.marketsignals24.com` | ✅ oui |
| `signal-engine` | `https://marketsignals24.com` | ❌ **non — à supprimer** |
| `frontend` | `https://marketsignals24.com` | ⚠️ incomplet (`www` manquant) |

Deux services revendiquent **le même hôte** `marketsignals24.com` → Traefik crée **deux
routeurs avec des règles identiques** (`Host("marketsignals24.com")`). À égalité de priorité,
le gagnant est **indéterminé** et peut changer à chaque redéploiement.

Conséquences :

1. **Site instable** : si le routeur `signal-engine` gagne, `marketsignals24.com/` renvoie du
   JSON FastAPI ou 404 au lieu du site Next.js.
2. **C'est très probablement la cause directe du « ads.txt introuvable »** : quand le routeur
   `signal-engine` gagne, `marketsignals24.com/ads.txt` renvoie **404** (FastAPI n'a aucune
   route `/ads.txt`) → Google conclut « introuvable ». Puis au redéploiement suivant, le
   frontend reprend la main et le fichier redevient accessible (d'où des statuts qui clignotent).
3. **Faille de sécurité** : cela exposerait publiquement l'API interne, dont `/docs`
   (Swagger UI) et les routes `/signals`, `/prices`, `/analysis`, `/backtest`.

### Preuve que le signal-engine n'a besoin d'aucun domaine public

`backend/src/routes/signals.ts` l'appelle en interne :

```ts
const SIGNAL_ENGINE_URL = process.env.SIGNAL_ENGINE_URL || 'http://localhost:8000';
```

et le frontend passe par le backend — cf. `frontend/src/app/page.tsx` :
`// Fetch live prices from signal-engine (via backend proxy)`.

Le signal-engine est donc un service **interne** (port 8000, `expose` seulement dans
`docker-compose.prod.yml`), consommé via `http://signal-engine:8000`.

## Vérification DNS (Hostinger) — ✅ correcte, rien à changer

Nameservers autoritaires : `ns1.dns-parking.com` / `ns2.dns-parking.com` (Hostinger) — la zone
Hostinger **est bien celle qui fait autorité**.

| Enregistrement | Valeur publiée | Statut |
|---|---|---|
| `A @` | `95.111.230.185` | ✅ serveur de production |
| `A www` | `95.111.230.185` | ✅ **existe déjà** et pointe au bon endroit |
| `A api` | `95.111.230.185` | ✅ backend |
| `MX @` | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) | ✅ |
| `TXT @` | `v=spf1 include:mxsspf.sendpulse.com include:_spf.mail.hostinger.com ~all` | ✅ |
| `TXT _dmarc` | `v=DMARC1; p=none` | ✅ valide |
| `TXT sign._domainkey` | DKIM SendPulse | ✅ |
| `CNAME hostingermail-a/b/c._domainkey` | DKIM Hostinger | ✅ |
| `CNAME autodiscover` / `autoconfig` | Hostinger Mail | ✅ |
| `CNAME stat` | `track.stat-pulse.com` → `pr.sendpulse.com` → `46.4.94.81` | ✅ tracking SendPulse |
| `AAAA` | aucun | ✅ non requis |
| `CAA` | aucun | ✅ non bloquant (Let's Encrypt fonctionne) |

**Conclusion : le DNS n'est pas la cause.** `www` résout déjà correctement vers le serveur —
la panne est donc **entièrement** du côté de Traefik/Coolify (routeur + certificat manquants).

> ⚠️ **Ne supprimez pas l'enregistrement `A www`** : il est correct. Il faut au contraire
> l'ajouter comme domaine dans Coolify.

### Note : codes de vérification Google incohérents

- `TXT @` → `google-site-verification=o48InX-8MtodfcC6x42MhF3MLs3z8QI77pMxM_ONrsE`
- `frontend/src/app/layout.tsx:35` → `google: 'eb94bneSZzVTVa4QRfdu_IplBWIW-1n-P2ge5k604Pc'`

Deux codes différents = deux propriétés Search Console distinctes (ou un code obsolète).
À vérifier : s'ils visent le même compte Google, retirez le code devenu inutile.

### Note : DMARC sans reporting

`v=DMARC1; p=none` est valide mais ne fournit aucun rapport d'usurpation. Pour l'améliorer :

```
v=DMARC1; p=none; rua=mailto:admin@marketsignals24.com
```

## Correctif

### 1. Infra — Coolify (obligatoire)

Configuration cible :

| Service | Domaine(s) à déclarer |
|---------|----------------------|
| `frontend` | `https://marketsignals24.com` **et** `https://www.marketsignals24.com` |
| `backend` | `https://api.marketsignals24.com` *(inchangé)* |
| `signal-engine` | **aucun domaine** — laisser vide |

Étapes :

1. **`signal-engine` → Domains : supprimer `https://marketsignals24.com`.**
   C'est la correction prioritaire : elle supprime le conflit et la faille de sécurité.
2. **`frontend` → Domains : ajouter `https://www.marketsignals24.com`** (en plus de l'apex).
   Coolify demandera alors à Let's Encrypt un certificat couvrant `marketsignals24.com`
   **et** `www.marketsignals24.com`, et Traefik créera le routeur manquant.
3. **Redéployer** les services concernés.

Vérifications attendues après déploiement :

```bash
# doit répondre 200, text/plain (jamais 404, jamais du JSON FastAPI)
curl -sI https://marketsignals24.com/ads.txt

# 200 ou 308/301 (redirection vers l'apex) — plus d'erreur SSL
curl -sI https://www.marketsignals24.com/ads.txt

# le signal-engine ne doit plus être joignable publiquement → 404 attendu
curl -sI https://marketsignals24.com/health

# le backend doit rester opérationnel
curl -s https://api.marketsignals24.com/api/health
```

### 2. Code — redirection canonique `www` → apex

`frontend/next.config.js` contient maintenant une redirection permanente par hôte, afin que
le trafic `www` (et donc `www/ads.txt`) soit ramené sur l'apex certifié :

```js
{
  source: '/:path*',
  has: [{ type: 'host', value: 'www.marketsignals24.com' }],
  destination: 'https://marketsignals24.com/:path*',
  permanent: true,
}
```

### 3. AdSense — forcer une nouvelle vérification

Le statut ads.txt est **mis en cache par Google**. Après le correctif :

1. AdSense → **Sites** → cliquer sur le site concerné.
2. Cliquer sur **Vérifier les mises à jour** (*Check for updates*).
3. Patienter : Google indique qu'il faut **quelques jours** pour que les changements
   apparaissent, et **jusqu'à un mois** pour un site générant peu de requêtes publicitaires.

## Rappel du contenu attendu du fichier

`frontend/public/ads.txt` doit contenir la ligne fournie par AdSense, avec **le même ID**
que le script `adsbygoogle` :

```
google.com, pub-5343389597650456, DIRECT, f08c47fec0942fa0
```

Prérequis respectés :
- fichier servi à la **racine** du domaine (`/ads.txt`) ;
- `Content-Type: text/plain` ;
- non bloqué par `robots.txt` (`/ads.txt` n'est pas dans une règle `Disallow`) ;
- encodage **UTF-8 sans BOM**, retours à la ligne `LF`.
