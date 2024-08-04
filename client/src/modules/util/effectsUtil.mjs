import { EightBallRespawn } from "../effects/eightBallRespawn.mjs";
import { PickUpBallIndicator } from "../effects/pickUpBallIndicator.mjs";

export class EffectsUtil {

    // linked lists.
    static loopedEffects = null;
    static activeEffects = null;

    static #pickUpBallEffect = null;

    // plays effect once
    static play(effect) {
        if (this.activeEffects) {
            let node = new Node(effect, this.activeEffects);
            this.activeEffects = node;
        }
        else {
            this.activeEffects = new Node(effect);
        }
        return effect;
    }

    // plays effect indefinetly
    static loop(effect) {
        if (this.loopedEffects !== null) {
            let node = new Node(effect, this.loopedEffects);
            this.loopedEffects = node;
        }
        else {
            this.loopedEffects = new Node(effect);
        }
        return effect;
    }

    // stops looped effect
    static stop(effect) {
        let head = this.loopedEffects;
        let prev = null;
        while(head) {
            if (head.val === effect) {
                // remove node
                if (prev) {
                    prev.next = head.next;
                }
                else {
                    this.loopedEffects = head.next;
                }
                return;
            }
            head = head.next;
        }
    }

    static draw(ctx) {
        
        // active effects
        let head = this.activeEffects;
        let prev = null;
        while(head) {
            if (!head.val.draw(ctx)) {
                // remove node
                if (prev) {
                    prev.next = head.next;
                }
                else {
                    this.activeEffects = head.next;
                }
                head = head.next;
            }
            else {
                prev = head;
                head = head.next;
            }
        }

        // looped effects
        head = this.loopedEffects;
        while(head) {
            if (!head.val.draw(ctx)) {
                console.log(head.val.counter);
                head.val.counter = 0;
            }
            head = head.next;
        }
    }

    // specific effects, only one per universe.
    static startBallPickUpEffect(position) {
        if (this.#pickUpBallEffect !== null) {
            if (position.equals(this.#pickUpBallEffect.ballPosition)) {
                return;
            }
            this.removeBallPickUpEffect();
        }
        console.log(position);
        this.#pickUpBallEffect = this.loop(new PickUpBallIndicator(position));
    }

    static removeBallPickUpEffect() {
        if (this.#pickUpBallEffect === null) {
            return;
        }
        this.stop(this.#pickUpBallEffect);
        this.#pickUpBallEffect = null;
    }

    static respawnEightBall(position) {
        this.play(new EightBallRespawn(position));
    }
}

// for linked list
class Node {
    val;
    next;
    constructor(val, next=null) {
        this.val = val;
        this.next = next;
    }
}