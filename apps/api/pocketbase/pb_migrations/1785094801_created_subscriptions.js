/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    createRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    fields: [
      {
        autogeneratePattern: '[a-z0-9]{15}',
        hidden: false,
        id: 'text1156484270',
        max: 15,
        min: 15,
        name: 'id',
        pattern: '^[a-z0-9]+$',
        presentable: false,
        primaryKey: true,
        required: true,
        system: true,
        type: 'text',
      },
      {
        hidden: false,
        id: 'relation0000000001',
        name: 'user',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'relation',
        collectionId: '_pb_users_auth_',
        cascadeDelete: false,
      },
      {
        hidden: false,
        id: 'relation0000000002',
        name: 'plan',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'relation',
        collectionId: 'pbc_plans_001',
        cascadeDelete: false,
      },
      {
        hidden: false,
        id: 'select1234567890',
        name: 'status',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'select',
        values: ['active', 'inactive', 'cancelled', 'suspended', 'expired'],
      },
      {
        hidden: false,
        id: 'date0000000001',
        name: 'startDate',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'date0000000002',
        name: 'endDate',
        presentable: true,
        primaryKey: false,
        required: false,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'text0148928954',
        name: 'paymentProvider',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'text0148928955',
        name: 'providerSubscriptionId',
        presentable: true,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'text0148928956',
        name: 'providerCustomerId',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'date0000000003',
        name: 'trialEndsAt',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'date0000000004',
        name: 'currentPeriodEnd',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'autodate1805822089',
        name: 'created',
        onCreate: true,
        onUpdate: false,
        presentable: false,
        system: false,
        type: 'autodate',
      },
      {
        hidden: false,
        id: 'autodate6425212905',
        name: 'updated',
        onCreate: true,
        onUpdate: true,
        presentable: false,
        system: false,
        type: 'autodate',
      },
    ],
    id: 'pbc_subscriptions_001',
    indexes: ['CREATE INDEX idx_subscriptions_user ON subscriptions(user)', 'CREATE INDEX idx_subscriptions_status ON subscriptions(status)'],
    listRule: '',
    name: 'subscriptions',
    system: false,
    type: 'base',
    updateRule: '@request.auth.id != ""',
    viewRule: '',
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes('Collection name must be unique')) {
      console.log('Collection already exists, skipping');
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId('pbc_subscriptions_001');
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes('no rows in result set')) {
      console.log('Collection not found, skipping revert');
      return;
    }
    throw e;
  }
});
