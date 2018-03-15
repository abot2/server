const dbName = "autobot";
const collSignalSourceName = "signal_source";

const MongoClient = require('mongodb').MongoClient;
const MongoOplog = require('mongo-oplog');
const assert = require('assert');
const dgram = require('dgram');

const dbUrlBegin = "mongodb://localhost:27017/";
const dbUrl = dbUrlBegin + dbName;

let signalSources = {};
let oplogSignalSources = 0;

function main() {
  MongoClient.connect(dbUrl, {reconnectTries: 999, reconnectInterval: 5000}, (err, db) => {
    if (err) {
      console.log(err.message);
      setTimeout(main, 5000);
      return;
    }

    setTimeout(() => {
      console.log("Connected successfully to mongodb server");

      let signalSource = db.db(dbName).collection(collSignalSourceName);

      signalSource.find().each((err, item) => {
        if (item == null) {
          beginSignalsListening();
        } else {
          let _id = item._id;
          delete item._id;
          signalSources[_id] = item;
        }
      });

      db.on('reconnect', oplogStart);
      db.on('timeout', oplogStop);
      db.on('close', oplogStop);
    }, 5000);
  });
}

function oplogStart() {
  let firstStart = (oplogSignalSources == 0);
  if (firstStart) {
    oplogSignalSources = MongoOplog(dbUrlBegin + "local", {ns: dbName + "." + collSignalSourceName});
  }
  oplogSignalSources.stop(() => {
    oplogSignalSources.tail(() => {
      console.log("Oplog started");
    });
  });
  if (firstStart) {
    oplogSignalSources.on('op', (doc) => {
      console.log(doc);
    });
  }
}

function oplogStop() {
  if (!oplogSignalSources) {
    return;
  }
  oplogSignalSources.stop(() => {
    console.log("Oplog stopped");
  });
}

function beginSignalsListening() {
  assert.notEqual(Object.keys(signalSources).length, 0, "Signal source list is empty");

  console.log(signalSources);

  oplogStart();

  for (let _id in signalSources) {
    const server = dgram.createSocket('udp4');

    //signalSources[_id].socket = server;

    server.bind(signalSources[_id].port, () => {
      const address = server.address();
      
      console.log(`Server listening ${address.address}:${address.port}`);

      server.on('message', (msg, rinfo) => {
        console.log(`Server got to ${address.port}: ${msg} from ${rinfo.address}:${rinfo.port}`);
      });
    });
  }
}

main();