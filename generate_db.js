const db = new Mongo().getDB("musicplayer")

db.userList.remove({})

const andy_id = db.userList.insertOne({
    name: 'A',
    password: '123'
}).insertedId.toString()

const bob_id = db.userList.insertOne({
    name: 'B',
    password: '234'
}).insertedId.toString()

db.songList.remove({})

db.songList.insertMany([{
    title: 'Kirari',
    singer: 'Fujii Kaze',
    filename: 'Kirari.mp3'
}, {
    title: 'Hana',
    singer: 'Fujii Kaze',
    filename: 'Hana.mp3'
}, {
    title: 'NIGHT DANCER',
    singer: 'imase',
    filename: 'nightdancer.mp3'
}])

db.collectionList.remove({})

db.collectionList.insertMany([{
    owner: 'A',
    name:"Collection 1",
    list: ["Hana"]
}])
