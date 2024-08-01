/**
 * Multiply With Carry (MWC) random generator
 * Source: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript.
 */
export class RandomUtil {
    static #m_w = 123456789;
    static #m_z = 987654321;
    static #mask = 0xffffffff;

    // Takes any integer
    static seed(i) {
        this.#m_w = (123456789 + i) & this.#mask;
        this.#m_z = (987654321 - i) & this.#mask;
    }

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    // just like Math.random().
    static random() {
        this.#m_z = (36969 * (this.#m_z & 65535) + (this.#m_z >> 16)) & this.#mask;
        this.#m_w = (18000 * (this.#m_w & 65535) + (this.#m_w >> 16)) & this.#mask;
        var result = ((this.#m_z << 16) + (this.#m_w & 65535)) >>> 0;
        result /= 4294967296;
        return result;
    }
}