/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    createRule: '@request.auth.id != ""',
    deleteRule: null,
    updateRule: 'user.id = @request.auth.id || @request.auth.id = "" ', // Only webhook or admins can update
    listRule: 'user.id = @request.auth.id', // Users see only their own
    viewRule: 'user.id = @request.auth.id', // Users see only their own
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
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      },
      {
        hidden: false,
        id: 'number0000000001',
        name: 'max_rank',
        presentable: true,
        primaryKey: false,
        required: false,
        system: false,
        type: 'number',
        default: 0,
      },
      {
        hidden: false,
        id: 'bool0000000001',
        name: 'active',
        presentable: true,
        primaryKey: false,
        required: false,
        system: false,
        type: 'bool',
        default: false,
      },
      {
        hidden: false,
        id: 'date0000000001',
        name: 'active_from',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'date0000000002',
        name: 'active_until',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'date',
      },
      {
        hidden: false,
        id: 'text0000000001',
        name: 'reason',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text', // e.g., 'trial', 'paid', 'complimentary'
      },
      {
        hidden: false,
        id: 'autodate0000000001',
        name: 'created',
        presentable: false,
        primaryKey: false,
        required: false,
        system: true,
        type: 'autodate',
        onCreate: true,
        onUpdate: false,
      },
      {
        hidden: false,
        id: 'autodate0000000002',
        name: 'updated',
        presentable: false,
        primaryKey: false,
        required: false,
        system: true,
        type: 'autodate',
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_entitlements_user ON entitlements (user)',
      'CREATE INDEX idx_entitlements_active ON entitlements (active)',
      'CREATE INDEX idx_entitlements_rank ON entitlements (max_rank)',
    ],
    id: 'pbc_entitlements_001',
    name: 'entitlements',
    system: false,
    type: 'base',
  });

  return app.save(collection);
}, (app) => {
  const dao = new Dao(app);
  const collection = dao.findCollectionByNameOrId('entitlements');

  return dao.delete(collection);
});
