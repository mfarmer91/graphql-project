const babelRelayPlugin = require('babel-relay-plugin');

const schema = require('./cache/schema.json');

module.exports = babelRelayPlugin(schema.data);

//All this does: imports plugin, uses it to prepare cached data to be plugged into babel.