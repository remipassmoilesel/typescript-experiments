# RBAC "brute"

Expérimentation sur la mise en place d'un scénario RBAC sans tenir compte des considérations de performance 
ou d'éfficacité pour tester la montée en charge de Keycloak. 

## Scénario

Un seul type de ressource protégée.

Deux types d'utilisateurs:

- Utilisateurs autorisés
- Administrateurs

Création de:
 
- 10 000 ressources à protéger 
- 50 000 utilisateurs

Soit une création de: 

- 10 000 rôles clients 'admin'  
- 10 000 rôles clients 'user'
- 10 000 rôles realm 'admin'  
- 10 000 rôles realm 'user'
- 20 000 politiques (policy)
- 20 000 permissions

## Déroulement

Le code de création n'est pas optimisé. Etapes:

    wait(this.createRealm());
    wait(this.createClient());
    wait(this.createResources());
    wait(this.createRealmRoles());
    wait(this.createClientRoles());
    wait(this.createPolicies());
    wait(this.createPermissions());
    wait(this.createUsers());
    wait(this.mapClientRoles());
    wait(this.mapRealmRoles());

Keycloak dans un conteneur Docker, lié à une base de données PostgreSQL en conteneur Docker également.

Scénario lancé à 19h00, non términé le lendemain à 10h19 (~9h), création des politiques en cours à la 1560e.

Ralentissements exponentiels dans toute l'API REST. Scénario non viable.

Le même scénario avec 100 ressources et 200 utilisateurs prend 2h00.