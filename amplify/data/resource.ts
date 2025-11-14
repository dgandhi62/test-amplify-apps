import { defineData } from "@aws-amplify/backend";

const schema = `# This "input" configures a global authorization rule to enable public access to
# all models in this schema. Learn more about authorization rules here: https://docs.amplify.aws/cli/graphql/authorization-rules
input AMPLIFY { globalAuthRule: AuthRule = { allow: public } } # FOR TESTING ONLY!

type Todo1 @model {
  id: ID!
  name: String!
  description: String
}

type User1 @model {
  id: ID!
  username: String! @index(name: "byUsername")
  email: String!
  firstName: String
  lastName: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Post1 @model {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  userID: ID! @index(name: "byUser")
  tags: [String]
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Comment1 @model {
  id: ID!
  content: String!
  postID: ID! @index(name: "byPost")
  author: String!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Product1 @model {
  id: ID!
  name: String!
  description: String
  price: Float!
  category: String! @index(name: "byCategory")
  inStock: Boolean!
  sku: String! @index(name: "bySku")
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Order1 @model {
  id: ID!
  customerEmail: String!
  status: OrderStatus!
  total: Float!
  shippingAddress: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type OrderItem1 @model {
  id: ID!
  orderID: ID! @index(name: "byOrder")
  productID: ID! @index(name: "byProduct")
  quantity: Int!
  price: Float!
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
`;

export const data = defineData({
    migratedAmplifyGen1DynamoDbTableMappings: [{
            //The "branchname" variable needs to be the same as your deployment branch if you want to reuse your Gen1 app tables
            branchName: "migratec",
            modelNameToTableNameMapping: { Todo1: "Todo1-2cmakhyatjc4tnw34mozzdc6yy-migratec", User1: "User1-2cmakhyatjc4tnw34mozzdc6yy-migratec", Post1: "Post1-2cmakhyatjc4tnw34mozzdc6yy-migratec", Comment1: "Comment1-2cmakhyatjc4tnw34mozzdc6yy-migratec", Product1: "Product1-2cmakhyatjc4tnw34mozzdc6yy-migratec", Order1: "Order1-2cmakhyatjc4tnw34mozzdc6yy-migratec", OrderItem1: "OrderItem1-2cmakhyatjc4tnw34mozzdc6yy-migratec" }
        }],
    schema
});
