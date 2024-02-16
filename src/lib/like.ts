import {
    DocumentReference,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

export const likePost = async () => {
    const ref = doc(db, 'counters/test');
    await incrementCounter(ref, 10);
    return getCount(ref);
};

export const getLikes = async () => {

    const ref = doc(db, 'counters/test');

    // create couter if doesn't exist
    const docRef = await getDoc(ref);

    if (!docRef.exists()) {
        await createCounter(ref, 10);
    }

    // get total
    return getCount(ref);
};

async function createCounter(ref: DocumentReference, num_shards: number) {
    const batch = writeBatch(db);

    // Initialize the counter document
    batch.set(ref, { num_shards: num_shards });

    // Initialize each shard with count=0
    for (let i = 0; i < num_shards; i++) {
        const shardRef = doc(db, `${ref.path}/shards/${i.toString()}`);
        batch.set(shardRef, { count: 0 });
    }

    // Commit the write batch
    return batch.commit();
}

async function incrementCounter(ref: DocumentReference, num_shards: number) {
    // Select a shard of the counter at random
    const shard_id = Math.floor(Math.random() * num_shards).toString();
    const shard_ref = doc(db, `${ref.path}/shards/${shard_id}`);

    // Update count
    return updateDoc(shard_ref, "count", increment(1));
}

async function getCount(ref: DocumentReference) {
    // Sum the count of each shard in the subcollection
    const snapshot = await getDocs(collection(db, `${ref.path}/shards`));
    let total_count = 0;
    snapshot.forEach((doc) => {
        total_count += doc.data().count;
    });
    return total_count;
}