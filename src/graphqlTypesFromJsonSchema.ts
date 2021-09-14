import { convert } from "@wittydeveloper/json-schema-to-graphql";
import { JSONSchema6 } from "json-schema";
import { Configuration } from ".";

export default function graphqlTypesFromJsonSchema(
  schema: JSONSchema6,
  config: Configuration
): string {
  const algoliaObjectType = convert(schema, {
    fallbackTypes: config.fallbackTypes,
  });

  return `
${algoliaObjectType}

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

type Query {
  # ...
  ${
    config.searchQueryName || "search"
  }($input: SearchInput!, $after: String): [SearchResults!]!
}
    `;
}
