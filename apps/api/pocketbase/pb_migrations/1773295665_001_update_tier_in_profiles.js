/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("profiles");
  const field = collection.fields.getByName("tier");
  field.values = ["Fan", "VIP", "Elite"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("profiles");
  const field = collection.fields.getByName("tier");
  field.values = ["Basic", "Pro", "VIP"];
  return app.save(collection);
})