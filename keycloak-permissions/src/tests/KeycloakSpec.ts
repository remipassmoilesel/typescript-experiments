import { KeycloakHelper } from '../lib/KeyloakHelper';
import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import { AuthSettings } from '../lib/AuthSettings';

const assert = chai.assert;

describe('Keycloak test', () => {

    const keycloakBaseUrl = 'http://172.17.0.3:8080/auth';
    const authSettings: AuthSettings = {
        baseUrl: keycloakBaseUrl,
        username: 'keycloak',
        password: 'keycloak',
        grant_type: 'password',
        client_id: 'admin-cli'
    };


    const helper = new KeycloakHelper(authSettings);

    const increment = new Date().toISOString().replace(/[-:.]+/ig, '');
    const realmName = `${increment}`;
    const clientName = `000-library-client-a`;

    const adminRoleName = 'admin';
    const authorizedUserRoleName = 'authorized_user';

    const getAdminRoleName = (resourceName) => {
        return `${adminRoleName}-${resourceName}`;
    };

    const getAuthorizedUserRoleName = (resourceName) => {
        return `${authorizedUserRoleName}-${resourceName}`;
    };

    const getAdminPolicyName = (resourceName) => {
        return `Admins can administrate ${resourceName}`;
    };

    const getAuthorizedUserPolicyName = (resourceName) => {
        return `Users can use ${resourceName}`;
    };

    const getAdminPermissionName = (resourceName) => {
        return `Permission - Admins can administrate ${resourceName}`;
    };

    const getAuthorizedUserPermissionName = (resourceName) => {
        return `Permission - Users can use ${resourceName}`;
    };

    const getResourceUri = (resourceName) => {
        return `uri:id:${resourceName}`;
    };

    const resources = [
        'library-A',
        'library-B',
        'library-C',
    ];

    it('Create a realm should success', () => {
        return helper.createRealm(realmName);
    });

    it('Create a client should success', () => {
        return helper.createClient(realmName, {
            clientId: clientName,
            name: clientName,
            description: `Description of ${clientName}`,
            redirectUris: ['http://localhost'],
            serviceAccountsEnabled: true,
            authorizationServicesEnabled: true,
        });
    });

    it('Create resources should success', () => {

        return helper.getInformationsForClients(realmName, clientName).then((clientsInfo) => {

            const clientUID: string = clientsInfo[0].id as any;
            const promises = _.forEach(resources, (resName) => {
                return helper.createResource(realmName, clientUID, {
                    name: resName,
                    scopes: [],
                    uri: getResourceUri(resName),
                });
            });

            return Promise.all(promises);
        });

    });

    it('Create realm roles should success', () => {
        const promises: Promise<any>[] = [];

        _.forEach(resources, (resName) => {

            promises.push(helper.createRealmRole(realmName, {
                name: getAdminRoleName(resName),
                scopeParamRequired: ''
            }));

            promises.push(helper.createRealmRole(realmName, {
                name: getAuthorizedUserRoleName(resName),
                scopeParamRequired: ''
            }));

        });

        return Promise.all(promises);
    });

    it('Get client informations from clientId should success', () => {
        return helper.getInformationsForClients(realmName, clientName);
    });

    it('Create a client role should success', () => {
        return helper.getInformationsForClients(realmName, clientName)
            .then((clientsInfo) => {
                const clientUid: string = clientsInfo[0].id as any;
                const promises: Promise<any>[] = [];

                _.forEach(resources, (resName) => {

                    promises.push(helper.createClientRole(realmName, clientUid, {
                        name: getAdminRoleName(resName),
                        scopeParamRequired: ''
                    }));

                    promises.push(helper.createClientRole(realmName, clientUid, {
                        name: getAuthorizedUserRoleName(resName),
                        scopeParamRequired: ''
                    }));

                });

                return Promise.all(promises);
            });
    });

    it('Get realm role informations should success', () => {
        return helper.getInformationsForClients(realmName, clientName).then((clientsInfo) => {

            const clientUID: string = clientsInfo[0].id as any;
            const promises: Promise<any>[] = [];
            promises.push(helper.getInformationsForRealmRoles(realmName, clientUID).then((rolesInfos) => {
                assert.isTrue(rolesInfos.length > 1);
            }));
            promises.push(helper.getRealmRoleInfos(realmName, clientUID, getAdminRoleName(resources[0])).then((rolesInfo) => {
                assert.isDefined(rolesInfo);
            }));

            return Promise.all(promises);
        });

    });

    it('Get client role informations should success', () => {
        return helper.getInformationsForClients(realmName, clientName).then((clientsInfo) => {

            const clientUID: string = clientsInfo[0].id as any;
            const promises: Promise<any>[] = [];
            promises.push(helper.getInformationsForClientsRoles(realmName, clientUID).then((rolesInfos) => {
                assert.isTrue(rolesInfos.length > 1);
            }));
            promises.push(helper.getClientRoleInfos(realmName, clientUID, getAdminRoleName(resources[0])).then((rolesInfo) => {
                assert.isDefined(rolesInfo);
            }));

            return Promise.all(promises);
        });

    });

    it('Create policies should success', () => {

        const promises: Promise<any>[] = [];
        _.forEach(resources, (res) => {
            promises.push(helper.createPolicyFor(realmName, getAdminPolicyName(res),
                clientName, getAdminRoleName(res), getAdminRoleName(res)));

            promises.push(helper.createPolicyFor(realmName, getAuthorizedUserPolicyName(res),
                clientName, getAuthorizedUserRoleName(res), getAuthorizedUserRoleName(res)));
        });

    });

    it('Get informations on resource should success', () => {

        return helper.getInformationsForClients(realmName, clientName).then((clientsInfo) => {
            const clientUID: string = clientsInfo[0].id as any;
            return helper.getResourceInformations(realmName, clientUID, getResourceUri(resources[0]))
                .then((infos) => {
                    assert.isDefined(infos);
                });
        });

    });

    it('Get informations on policy should success', () => {

        return helper.getInformationsForClients(realmName, clientName).then((clientsInfo) => {
            const clientUID: string = clientsInfo[0].id as any;
            return helper.getPoliciesInformations(realmName, clientUID, getAdminPolicyName(resources[0]))
                .then((infos) => {
                    assert.isDefined(infos);
                });
        });

    });

    it('Create permissions should success', () => {

        const promises: Promise<any>[] = [];
        _.forEach(resources, (res) => {
            promises.push(helper.createPermissionFor(
                realmName,
                clientName,
                getAdminPermissionName(res),
                res,
                getAdminPolicyName(res)
            ));

            promises.push(helper.createPermissionFor(
                realmName,
                clientName,
                getAuthorizedUserPermissionName(res),
                res,
                getAuthorizedUserPolicyName(res)
            ));

        });

        return Promise.all(promises);

    });


    it.skip('evaluate should success', () => {

        // TODO: finalize

        // const config: AuthSettings = {
        //     evaluatePath: '/admin/realms/library-poc/clients/e47e0f0d-2932-4d7f-8533-1f7eac9305cf/authz/resource-server/policy/evaluate',
        //     baseUrl: keycloakBaseUrl,
        //     username: 'keycloak',
        //     password: 'keycloak',
        //     grant_type: 'password',
        //     client_id: 'admin-cli'
        // };
        //
        // const payload = {
        //     'resources': [{
        //         'name': 'library_a',
        //         'uri': '/library-a',
        //         'type': 'library-api:library',
        //         'owner': { 'id': 'e47e0f0d-2932-4d7f-8533-1f7eac9305cf', 'name': 'library_api' },
        //         '_id': '6ae3b27b-4b43-413b-b5f9-81d79a89a189',
        //         'scopes': ['Edit']
        //     }],
        //     'context': { 'attributes': {} },
        //     'roleIds': ['library_administrator'],
        //     'clientId': 'e47e0f0d-2932-4d7f-8533-1f7eac9305cf',
        //     'userId': '2c594d05-6ecb-4f86-9df8-ca9933aec6ba',
        //     'entitlements': false
        // };
        //
        // return helper.evaluate(config, payload);

    });

});