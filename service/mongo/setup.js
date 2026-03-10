const replicaSetConfig = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary-a:27017", priority: 1 },
  ],
};

const maxAttempts = 60;
const waitMs = 1000;

function getReplicaStatus() {
  try {
    return db.adminCommand({ replSetGetStatus: 1 });
  } catch (error) {
    return {
      ok: 0,
      code: error.code,
      codeName: error.codeName,
      message: error.message,
      errmsg: error.errmsg,
    };
  }
}

function isNotYetInitialized(status) {
  const message = `${status.message ?? status.errmsg ?? ""}`.toLowerCase();

  return (
    status.code === 94 ||
    status.codeName === "NotYetInitialized" ||
    message.includes("not yet initialized") ||
    message.includes("no replset config has been received")
  );
}

function initiateReplicaSet() {
  try {
    return db.adminCommand({ replSetInitiate: replicaSetConfig });
  } catch (error) {
    return {
      ok: 0,
      code: error.code,
      codeName: error.codeName,
      message: error.message,
      errmsg: error.errmsg,
    };
  }
}

function hasPrimary(status) {
  if (!Array.isArray(status.members)) {
    return false;
  }

  return status.members.some((member) => member.stateStr === "PRIMARY");
}

const currentStatus = getReplicaStatus();

if (currentStatus.ok === 1) {
  print("Replica set already initialized.");
  printjson({
    set: currentStatus.set,
    members: (currentStatus.members ?? []).map((member) => ({
      name: member.name,
      state: member.stateStr,
    })),
  });
  quit(0);
}

if (!isNotYetInitialized(currentStatus)) {
  print("Unable to determine replica set status before initialization.");
  printjson(currentStatus);
  quit(1);
}

print("Replica set not initialized. Running rs.initiate...");
const initiateResult = initiateReplicaSet();

if (initiateResult.ok !== 1) {
  print("Replica set initiation failed.");
  printjson(initiateResult);
  quit(1);
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  sleep(waitMs);

  const status = getReplicaStatus();
  if (status.ok === 1 && hasPrimary(status)) {
    print("Replica set initialized successfully.");
    printjson({
      set: status.set,
      members: (status.members ?? []).map((member) => ({
        name: member.name,
        state: member.stateStr,
      })),
    });
    quit(0);
  }
}

print("Timed out waiting for PRIMARY after initialization.");
printjson(getReplicaStatus());
quit(1);
