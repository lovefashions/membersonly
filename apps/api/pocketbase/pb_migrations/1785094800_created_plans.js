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
        id: 'text0000590363',
        name: 'name',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'text0739701040',
        name: 'description',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'number4108379941',
        name: 'price',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'number',
      },
      {
        hidden: false,
        id: 'select1234567890',
        name: 'tier',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'select',
        values: ['fan', 'vip', 'elite'],
      },
      {
        hidden: false,
        id: 'json2525324044',
        name: 'features',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'json',
      },
      {
        hidden: false,
        id: 'text0148928954',
        name: 'paypalPlanId',
        presentable: true,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      },
      {
        hidden: false,
        id: 'bool2973171757',
        name: 'active',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'bool',
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
    id: 'pbc_plans_001',
    indexes: [],
    listRule: '',
    name: 'plans',
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
    const collection = app.findCollectionByNameOrId('pbc_plans_001');
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes('no rows in result set')) {
      console.log('Collection not found, skipping revert');
      return;
    }
    throw e;
  }
});
