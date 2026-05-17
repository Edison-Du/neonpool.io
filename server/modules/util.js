class Util {
    static getGameSeed() {
        return Math.floor(Math.random() * (1<<21));
    }
}

module.exports = Util;