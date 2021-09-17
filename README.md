# Algolia GraphQL Schema

Given an Algolia index, generates valid GraphQL types for exposing a GraphQL backend search Query

## Install

```bash
npm install -D algolia-graphql-schema
```

## Configuration

`algolia_graphql_config.json` example file:

```js
{
  "algoliaIndex": "products",
  "algoliaAppId": "",
  "algoliaAdminApiKey": "",
  "outputDir": "typedefs/", // default: "."
  "outputFileName": "algolia", // default: uses `algoliaIndex` property
  "searchQueryName": "search_products", // default: "search"
  // provide type mapping for unsupported GraphQL types (ex: scalar unions, objects)
  "fallbackTypes": {
    "collections[]": "string"
  },
  // array like values are nullable by default
  "arraysNullable": false
}
```

## Example

For an Algolia index with the following objects:

```js
[
  {
    "id": "e2866573-7591-4742-b2bc-891b78d679bd",
    "title": "Handcrafted Concrete Pants",
    // empty arrays will resolves to null[] which is not supported by GQL
    //  fortunately, we provide a fallback type for `collections[]`
    "collections": [],
    "shipping": "Free shipping",
    "salePrice": 781
  },
  {
    "id": "a07d4dd8-7fc8-40b6-9879-cf6e0dd9efb7",
    "title": "Refined Soft Chicken",
    "collections": [],
    "salePrice": 657
  }
]
```

by adding the following script to the `package.json`:

```json
// ...
"scripts": {
  "generate:graphql": "algolia-graphql-schema"
},
// ...
```

And running the script:

```bash
$ npm link
$ npm run generate:graphql

> algolia-graphql-demo-server@1.0.0 generate:graphql
> algolia-graphql-schema

Analyzing products index (that might take a few seconds...)
products.graphql created!
```

the following `products.graphql` is generated:

```graphql
type AlgoliaResultObject {
  id: String!
  title: String!
  collections: [String!]!
  salePrice: Int!
  shipping: String
}

type SearchResultsEdge {
  cursor: Int!
  node: AlgoliaResultObject
}

type SearchResults {
  edges: [SearchResultsEdge!]!
  totalCount: Int!
}

input SearchInput {
  query: String

  similarQuery: String

  # ...
}

type Query {
  # ...
  search_products($input: SearchInput!, $after: String): [SearchResults!]!
}
```

## Algolia search params support

### Disclaimer

GraphQL does not support union on scalar types.

For this reason, the following Algolia search params have the following breaking GraphQL type definition changes:

- `facetFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;` ➡️ `facetFilters: [String]`
- `optionalFilters?: string | readonly string[] | ReadonlyArray<readonly string[] | string>;` ➡️ `optionalFilters: [String]`
- `numericFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;` ➡️ `numericFilters: [String]`
- `tagFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;` ➡️ `tagFilters: [String]`
- `aroundRadius?: number | 'all';` ➡️ `aroundRadius: Int`
- `aroundPrecision?: number | ReadonlyArray<{ from: number; value: number; }>;` ➡️ `aroundPrecision: Int`
- `ignorePlurals?: boolean | readonly string[];` ➡️ `ignorePlurals: Boolean`
- `removeStopWords?: boolean | readonly string[];` ➡️ `removeStopWords: Boolean`
- `distinct?: boolean | number;` ➡️ `distinct: Boolean`
- `optionalWords?: string | readonly string[];` ➡️ `optionalWords: [String]`

### `SearchInput` type

The generated search query `SearchInput` type is the following:

```graphql
input SearchInput {
  query: String

  similarQuery: String

  facetFilters: [String]

  optionalFilters: [String]

  numericFilters: [String]

  tagFilters: [String]

  sumOrFiltersScores: Boolean

  filters: String

  page: Int

  hitsPerPage: Int

  offset: Int

  length: Int

  attributesToHighlight: [String]

  attributesToSnippet: [String]

  attributesToRetrieve: [String]

  highlightPreTag: String

  highlightPostTag: String

  snippetEllipsisText: String

  restrictHighlightAndSnippetArrays: Boolean

  facets: [String]

  maxValuesPerFacet: Int

  facetingAfterDistinct: Boolean

  minWordSizefor1Typo: Int

  minWordSizefor2Typos: Int

  allowTyposOnNumericTokens: Boolean

  disableTypoToleranceOnAttributes: [String]

  queryType: String

  removeWordsIfNoResults: String

  advancedSyntax: Boolean

  advancedSyntaxFeatures: [String]

  optionalWords: [String]

  disableExactOnAttributes: [String]

  exactOnSingleWordQuery: String

  alternativesAsExact: [String]

  enableRules: Boolean

  ruleContexts: [String]

  distinct?: boolean | number;

  analytics: Boolean

  analyticsTags: [String]

  synonyms: Boolean

  replaceSynonymsInHighlight: Boolean

  minProximity: Int

  responseFields: [String]

  maxFacetHits: Int

  percentileComputation: Boolean

  clickAnalytics: Boolean

  personalizationImpact: Int

  enablePersonalization: Boolean

  restrictSearchableAttributes: [String]

  sortFacetValuesBy: String

  typoTolerance: String

  aroundLatLng: String

  aroundLatLngViaIP: Boolean

  aroundRadius: Int

  aroundPrecision: Int

  minimumAroundRadius: Int

  insideBoundingBox: [Int]

  insidePolygon: [Int]

  ignorePlurals: Boolean

  removeStopWords: Boolean

  naturalLanguages: [String]

  getRankingInfo: Boolean

  userToken: String

  enableABTest: Boolean

  decompoundQuery: Boolean

  relevancyStrictness: Int
}
```
