import {
    collection,
    doc,
    getAggregateFromServer,
    getDoc,
    getDocs,
    increment,
    sum,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

const NUM_SHARDS = 10;
const ref = doc(db, 'counters/test');


async function createCounter() {

    const batch = writeBatch(db);

    // Initialize the counter document
    batch.set(ref, { num_shards: NUM_SHARDS });

    // Initialize each shard with count=0
    for (let i = 0; i < NUM_SHARDS; i++) {
        const shardRef = doc(db, `${ref.path}/shards/${i.toString()}`);
        batch.set(shardRef, { count: 0 });
    }

    // Commit the write batch
    return batch.commit();
}

export async function incrementCounter() {

    // Select a shard of the counter at random
    const shard_id = Math.floor(Math.random() * NUM_SHARDS).toString();
    const shard_ref = doc(db, `${ref.path}/shards/${shard_id}`);

    // Update count
    await updateDoc(shard_ref, "count", increment(1));

    return getCount();
}

export async function getCount() {

    const ref = doc(db, 'counters/test');

    // create couter if doesn't exist
    const docRef = await getDoc(ref);

    if (!docRef.exists()) {
        await createCounter();
    }

    // Sum the count of each shard in the subcollection

    /*
    const snapshot = await getDocs(collection(db, `${ref.path}/shards`));
    let total_count = 0;
    snapshot.forEach((doc) => {
        total_count += doc.data().count;
    });
    return total_count;
    */

    const snapshot = await getAggregateFromServer(
        collection(db, `${ref.path}/shards`), {
        totalCount: sum('count')
    });

    return snapshot.data().totalCount;
}

