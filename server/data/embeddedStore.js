const bcrypt = require('bcryptjs');
const {
  initialUsers,
  initialParks,
  initialTrees,
  initialUrbanForests,
  initialGreenBelts,
  initialEnvironmentalIndicators,
  initialMaintenances,
  initialReports
} = require('./seedData');

class EmbeddedStore {
  constructor() {
    this.users = [];
    this.parks = [];
    this.trees = [];
    this.urbanForests = [];
    this.greenBelts = [];
    this.environmentalIndicators = [];
    this.maintenances = [];
    this.reports = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // Clone and hash passwords
    this.users = await Promise.all(initialUsers.map(async (u) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      return { ...u, password: hashedPassword };
    }));

    this.parks = JSON.parse(JSON.stringify(initialParks));
    this.trees = JSON.parse(JSON.stringify(initialTrees));
    this.urbanForests = JSON.parse(JSON.stringify(initialUrbanForests));
    this.greenBelts = JSON.parse(JSON.stringify(initialGreenBelts));
    this.environmentalIndicators = JSON.parse(JSON.stringify(initialEnvironmentalIndicators));
    this.maintenances = JSON.parse(JSON.stringify(initialMaintenances));
    this.reports = JSON.parse(JSON.stringify(initialReports));

    this.initialized = true;
    console.log('🌱 [EmbeddedStore] In-memory database initialized with realistic sample records.');
  }

  _generateId() {
    return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }

  // Generic helper for matching simple filter object
  _matches(item, filter = {}) {
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined || val === null || val === '') continue;
      if (key === '$or' && Array.isArray(val)) {
        const matchesAny = val.some(subFilter => this._matches(item, subFilter));
        if (!matchesAny) return false;
        continue;
      }
      if (val instanceof RegExp) {
        if (!val.test(String(item[key] || ''))) return false;
      } else if (typeof val === 'object' && val.$regex) {
        const reg = new RegExp(val.$regex, val.$options || 'i');
        if (!reg.test(String(item[key] || ''))) return false;
      } else if (String(item[key]) !== String(val)) {
        return false;
      }
    }
    return true;
  }

  // Collection CRUD generator
  getCollection(name) {
    const coll = this[name];
    return {
      find: (filter = {}) => {
        let results = coll.filter(item => this._matches(item, filter));
        return {
          sort: (sortObj = {}) => {
            const key = Object.keys(sortObj)[0];
            const dir = sortObj[key] === -1 ? -1 : 1;
            if (key) {
              results.sort((a, b) => {
                if (a[key] < b[key]) return -1 * dir;
                if (a[key] > b[key]) return 1 * dir;
                return 0;
              });
            }
            return results;
          },
          lean: () => results,
          exec: async () => results,
          then: (resolve) => resolve(results)
        };
      },
      findById: (id) => {
        const item = coll.find(x => String(x._id) === String(id));
        return {
          exec: async () => item,
          then: (resolve) => resolve(item)
        };
      },
      findOne: (filter = {}) => {
        const item = coll.find(x => this._matches(x, filter));
        return {
          exec: async () => item,
          then: (resolve) => resolve(item)
        };
      },
      create: async (data) => {
        const doc = {
          _id: data._id || this._generateId(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        coll.unshift(doc);
        return doc;
      },
      findByIdAndUpdate: async (id, data, options = {}) => {
        const index = coll.findIndex(x => String(x._id) === String(id));
        if (index === -1) return null;
        coll[index] = { ...coll[index], ...data, updatedAt: new Date() };
        return coll[index];
      },
      findByIdAndDelete: async (id) => {
        const index = coll.findIndex(x => String(x._id) === String(id));
        if (index === -1) return null;
        const deleted = coll.splice(index, 1)[0];
        return deleted;
      },
      countDocuments: async (filter = {}) => {
        return coll.filter(item => this._matches(item, filter)).length;
      }
    };
  }
}

const embeddedStore = new EmbeddedStore();

module.exports = embeddedStore;
