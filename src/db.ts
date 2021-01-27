import Database from '@replit/database';

// @ts-ignore
const db = new Database();

const listDatabaseValues = (cb: (res: string) => void) => {
  db.list().then((keys: string[]) => {
    keys.forEach((key: string) => {
      db.get(key).then((value: string) => {
        cb(`store[${key}]: ${value}`);
      });
    });
  });
};

const getDatabaseValue = async (key: string) => {
  const value = await db.get(key);
  return value;
};

const setDatabaseValue = (
  key: string,
  newValue: any,
  cb: (res: string) => void,
) => {
  db.get(key).then((prevValue: any) => {
    db.set(key, newValue).then((updatedValue: any) => {
      cb(`store[${key}] changed from ${prevValue} to ${updatedValue}`);
    });
  });
};

const deleteDatabaseValue = (key: string, cb: (res: string) => void) => {
  db.get(key).then((prevValue: any) => {
    db.delete(key).then(() => {
      cb(`store[${key}]: ${prevValue} has been deleted`);
    });
  });
};

const initialDatabaseStore = {
  ready: true,
};

export const initialiseDatabase = async (cb: (res: string) => void) => {
  const isReady = await getDatabaseValue('ready');
  if (isReady) {
    cb('Gonna clear out the trash...');
    db.empty();
    return;
  }
  Object.keys(initialDatabaseStore).forEach((key) => {
    // @ts-ignore
    db.set(key, initialDatabaseStore[key]).then(() => {
      // @ts-ignore
      cb(`Setting store[${key}] = ${initialDatabaseStore[key]}.`);
    });
  });
};
