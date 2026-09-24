# 05 — Diagnostic multi-sites (serveur `95.111.230.185`)
> ⚠️ **RECTIFICATION (fin de diagnostic, 24/09/2026)** : le tableau « Mise à jour » ci-dessous
> indiquait `marketsignals24.com` comme résolu. **Ce n'est plus le cas.** De nouveaux tests
> montrent que l'**apex `https://marketsignals24.com` renvoie désormais 503** (routeur Traefik
> pointant vers un backend mort), tandis que `https://www.marketsignals24.com` répond 200.
> L'URL indexée par Google étant l'apex, **c'est un incident de production à corriger en priorité**
> (voir `docs/04-ADSENSE-ADS-TXT.md`, section « INCIDENT EN COURS »).



Rapport établi le 24/09/2026. Tous les sites ci-dessous sont hébergés sur **le même serveur
Coolify** (`95.111.230.185`), découvert par recherche IP inversée.

## Sites hébergés sur ce serveur

| Domaine | Technologie | Rôle |
|---|---|---|
| `marketsignals24.com` | Next.js (ce dépôt) | Plateforme de signaux (site principal) |
| `imparami.com` | Next.js | Plateforme de cours particuliers en ligne |
| `realtimetradesignals.com` | HTML statique via `nginx/1.31.2` | Landing page de signaux |
| `tradecomparator.com` | Next.js | Comparateur |
| `cryptosignalsx.com` | *(non déployé)* | — |

## Tableau de diagnostic

| Domaine | `ads.txt` (apex) | `www` | Problème principal |
|---|---|---|---|
| `marketsignals24.com` | 🔴 **503** | ✅ 200 | **Apex en panne** (routeur Traefik → backend mort) |
| `imparami.com` | ✅ 200 | 🔴 **SSL** | `www` non déclaré dans Coolify |
| `realtimetradesignals.com` | ✅ 200 | 🔴 **SSL** | `www` non déclaré + **contenu faible** |
| `tradecomparator.com` | 🔴 **404** | 🔴 **SSL** | **`ads.txt` MANQUANT** + `www` + pas de `robots.txt` |
| `cryptosignalsx.com` | 🔴 non routé | 🔴 non routé | **Site non déployé dans Coolify** |

### Mise à jour — état après vos corrections (24/09/2026)

| Domaine | `ads.txt` apex | `ads.txt` www | Statut |
|---|---|---|---|
| `marketsignals24.com` | ✅ **200** | ✅ **200** | ✅ **RÉSOLU** (apex réparé + `www` certifié) |
| `imparami.com` | ✅ 200 | 🔴 SSL | ⏳ reste le `www` à déclarer |
| `realtimetradesignals.com` | ✅ 200 | 🔴 SSL | ⏳ reste le `www` + contenu à enrichir |
| `tradecomparator.com` | 🔴 **404** | 🔴 SSL | ⏳ créer `ads.txt` + déclarer `www` |
| `cryptosignalsx.com` | 🔴 non routé | 🔴 non routé | ⏳ site non déployé |

Tous ces domaines ont un enregistrement DNS `A` correct (apex **et** `www` → `95.111.230.185`).
**Le DNS n'est donc jamais en cause** : les défauts sont tous dans **Coolify**.

> **FAIT IMPORTANT** : les 4 sites déclarent le **même identifiant éditeur AdSense**
> `pub-5343389597650456` (donc un seul compte AdSense). C'est normal et autorisé — mais
> **chaque domaine doit héberger son propre fichier `ads.txt` à sa racine**.

---

## Problème 1 — `www` en erreur SSL sur TOUS les sites

Symptôme identique partout : `www.<domaine>` présente le certificat auto-signé
`CN=TRAEFIK DEFAULT CERT` → le navigateur (et Googlebot) refuse la connexion.

**Cause** : le `www` n'est déclaré comme domaine dans **aucune** application Coolify.

**Correction** — pour **chaque** application, dans `Domains`, mettre le domaine **et** le `www`,
séparés par une virgule :

| Application Coolify | Valeur exacte du champ `Domains` |
|---|---|
| frontend `marketsignals24.com` | `https://marketsignals24.com,https://www.marketsignals24.com` |
| app `imparami.com` | `https://imparami.com,https://www.imparami.com` |
| app `realtimetradesignals.com` | `https://realtimetradesignals.com,https://www.realtimetradesignals.com` |
| app `tradecomparator.com` | `https://tradecomparator.com,https://www.tradecomparator.com` |

Coolify demandera alors un certificat Let's Encrypt couvrant les deux hôtes.

**Rappel** : ne jamais affecter le même domaine complet à deux applications (Coolify affiche
un avertissement de conflit) — c'est ce qui provoque le 503 et empêche la bonne émission du
certificat.

---

## Problème 2 — `tradecomparator.com` : fichier `ads.txt` absent (404)

`https://tradecomparator.com/ads.txt` renvoie **404** → c'est exactement le statut
**« ads.txt introuvable »** affiché dans AdSense.

Le site est en **Next.js**, le fichier doit donc être placé dans :

```
public/ads.txt
```

**Contenu exact du fichier à créer** (`pub-…` = l'ID de votre compte AdSense) :

```
google.com, pub-5343389597650456, DIRECT, f08c47fec0942fa0
```

Puis redéployer l'application. Sans ce fichier, AdSense restera indéfiniment en
« introuvable » pour ce domaine, même après correction du `www`.

### Bonus — `robots.txt` absent sur `tradecomparator.com`

`https://tradecomparator.com/robots.txt` renvoie une erreur : ce site n'a **aucun**
`robots.txt`. À créer dans `public/robots.txt` :

```
User-agent: *
Allow: /

Sitemap: https://tradecomparator.com/sitemap.xml
```

> Pour un site Next.js (App Router), la convention de ce dépôt est d'utiliser
> `src/app/robots.ts` et `src/app/sitemap.ts` plutôt que des fichiers statiques.
> Les deux approches fonctionnent ; les fichiers statiques dans `public/` sont les plus simples.

---

## Problème 3 — `cryptosignalsx.com` : site totalement inaccessible

Constats :

- DNS correct : apex **et** `www` → `95.111.230.185` ✅
- `https://cryptosignalsx.com/` → échec de connexion, certificat `CN=TRAEFIK DEFAULT CERT`
- `http://cryptosignalsx.com/` → **404** de Traefik
- `https://www.cryptosignalsx.com/` → échec de connexion

**Conclusion** : le domaine résout en DNS mais **aucune application Coolify ne le sert**. Soit
l'application n'existe plus, soit son domaine a été retiré.

**Deux options :**

1. **Le site doit vivre** → recréer/déployer l'application dans Coolify puis lui affecter
   `https://cryptosignalsx.com,https://www.cryptosignalsx.com`.
2. **Le site est abandonné** → ne le soumettez pas à AdSense (il sera refusé). Si le domaine
   est réellement inutilisé, retirez son enregistrement DNS `A` pour éviter qu'il ne pointe
   vers un serveur qui ne le sert pas.

---

## Problème 4 — `marketsignals24.com` : apex en 503 (incident en cours)

Voir le détail dans `docs/04-ADSENSE-ADS-TXT.md` (section « 🔴 INCIDENT EN COURS »).
Résumé : le domaine apex est probablement encore attribué à `signal-engine`. Correction :
`https://marketsignals24.com,https://www.marketsignals24.com` sur **frontend** et **aucun
domaine** sur **signal-engine**.

---

## Problème 5 — « Contenu de faible valeur » (refus AdSense)

Google exige officiellement un contenu **« high-quality, original, and attract an audience »**
(source : *Eligibility requirements for AdSense*). Un refus « Contenu de faible valeur »
(*Low value content*) signifie que le site est jugé trop pauvre ou non original.

### Analyse de vos sites

| Site | Poids page d'accueil | Risque |
|---|---|---|
| `realtimetradesignals.com` | **~11 Ko** | 🔴 **très élevé** — page unique très courte |
| `tradecomparator.com` | ~44 Ko | 🟠 moyen |
| `marketsignals24.com` | ~39 Ko | 🟠 moyen |
| `imparami.com` | ~185 Ko | 🟢 faible (contenu riche, 30+ matières) |

### Le risque majeur : contenu dupliqué entre vos propres sites

`realtimetradesignals.com` est une **landing page d'environ 11 Ko qui renvoie explicitement
vers `marketsignals24.com`** en le présentant comme « *our new flagship platform* ». Google
classe ce schéma comme du **contenu de faible valeur / page passerelle** (*doorway page*) —
une cause classique de refus, qui peut aussi pénaliser les deux sites.

Autrement dit : avoir plusieurs sites sur le **même sujet** (signaux de trading) avec du
contenu recyclé revient à se concurrencer soi-même **et** déclenche le refus AdSense.

### Actions concrètes

1. **Un seul site « riche » par sujet.** Concentrez le contenu de trading sur
   `marketsignals24.com` et **ne dupliquez pas** le même texte sur `realtimetradesignals.com`.
2. **Soit vous enrichissez, soit vous désindexez** `realtimetradesignals.com` :
   - **Option A — enrichir** : contenu réellement original (articles de fond, analyses,
     guides, glossaire, blog). Viser plusieurs milliers de mots uniques répartis sur
     plusieurs pages.
   - **Option B — désindexer** : `<meta name="robots" content="noindex">` (ou en-tête
     `X-Robots-Tag`) puis **retirer le site d'AdSense**. Coolify propose un sélecteur
     d'indexation par domaine dans les réglages du domaine.
3. **Pages obligatoires sur chaque site soumis** : *À propos*, *Contact* (e-mail/adresse
   réelle), *Politique de confidentialité*, *Conditions d'utilisation*. Un site sans page
   « Contact » ni « À propos » est presque systématiquement refusé.
4. **Supprimer la mention croisée** « visite marketsignals24.com, notre nouvelle plateforme »
   sur `realtimetradesignals.com` : c'est le signal le plus évident de page passerelle.
5. **Publier régulièrement** du contenu original (le dépôt principal possède déjà
   `src/app/blog/` — servez-vous en réellement, avec des articles de fond).
6. **Ne pas soumettre plusieurs sites quasi identiques à AdSense.** Faites d'abord approuver
   un seul site bien nourri, puis les autres **uniquement** s'ils ont un contenu propre et
   distinct.

---

## Plan d'action récapitulatif

| # | Action | Où | Priorité |
|---|---|---|---|
| 1 | `marketsignals24.com` : remettre l'apex sur **frontend**, vider le domaine de **signal-engine** | Coolify | 🔴 **critique** |
| 2 | `tradecomparator.com` : créer `public/ads.txt` | dépôt du site | 🔴 haute |
| 3 | Ajouter `www` à **chaque** application (champ `Domains`, séparés par virgule) | Coolify | 🟠 haute |
| 4 | `tradecomparator.com` : créer `public/robots.txt` | dépôt du site | 🟡 moyenne |
| 5 | `cryptosignalsx.com` : déployer **ou** abandonner proprement | Coolify | 🟡 moyenne |
| 6 | `realtimetradesignals.com` : enrichir le contenu **ou** passer en `noindex` | dépôt du site | 🟠 haute (AdSense) |
| 7 | AdSense : **Sites → Vérifier les mises à jour** après chaque correction | AdSense | après 1-4 |

## Vérification finale (après corrections)

```bash
for d in marketsignals24.com imparami.com realtimetradesignals.com tradecomparator.com; do
  echo "--- $d ---"
  curl -s -o /dev/null -w "apex/ads.txt : %{http_code}\n" "https://$d/ads.txt"
  curl -s -o /dev/null -w "www/ads.txt  : %{http_code}\n" "https://www.$d/ads.txt"
done

# Attendu : 200 (ou 301/308) partout. Aucun 404, aucun 503.
```



