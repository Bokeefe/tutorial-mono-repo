import {
    GraphQLServer
} from "graphql-yoga";
import {
    uuid
} from 'uuidv4';

const users = [{
    id: 1,
    name: 'Brendan',
    email: 'nothing.okay@aol.org',
    age: 25
}, {
    id: 2,
    name: 'Gwen',
    email: 'rose@aol.org',
    age: 65
}, {
    id: 3,
    name: 'mike',
    email: 'mike@aol.org',
    age: 45
}]

const posts = [{
    id: 43534,
    author: 2,
    title: "my add",
    body: "loremkjsndfkjdsfkjsdbfksbdf",
    published: true
}, {
    id: 345,
    author: 3,
    title: "personal sob story",
    body: "lorsdfdsfdsghgfdfkjdshhfgfkjsdbfksbdf",
    published: false
}, {
    id: 3453,
    author: 2,
    title: "okay",
    body: "loremkjsnsdfgghfhfgdfkjdsfkjsdbfksbdf",
    published: true
}]

// type definitions
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User
        post: Post
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text:String!,author:ID!): Comment!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
    }

    type Post {
        id: ID!
        author: User!
        title: String!
        body: String!
        published: Boolean!
    }
    `

// resolvers
const resolvers = {
    Query: {
        // search for match from argument
        users(parent, args, ctx, info) {
            return args.query ? users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            }) : users;
        },
        me() {
            return {
                id: 'asdasdjnkksjdf',
                name: 'Brendan',
                email: 'bokeefe@yahoo.com'
            }
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }

            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())

                return isTitleMatch || isBodyMatch
            })
        },
        post() {
            return {
                id: 'hererId',
                title: 'blog post',
                body: 'lorem all that',
                published: true
            }
        }

    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => {
                return user.email === args.email;
            });

            if (emailTaken) {
                throw new Error('Email Taken')
            }

            const user = {
                id: parseInt(uuid()),
                name: args.name,
                email: args.email,
                age: args.age,
                posts: []
            }
            users.push(user);
            return user;
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => {
                return user.id === args.author
            });

            if (!userExists) {
                throw new Error('user not found')
            }

            const post = {
                id: parseInt(uuid()),
                title: args.title,
                body: args.body,
                published: args.published,
                author: args.author
            }
            posts.push(post);
            return post
        }
    },

    // relational examples
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
});

server.start(() => {
    console.log('server is up')
})