function renameProperty(obj, oldkey, newkey) {
    Object.defineProperty(obj, newkey, Object.getOwnPropertyDescriptor(obj, oldkey));
    delete obj[oldkey];
}

module.exports = renameProperty;
