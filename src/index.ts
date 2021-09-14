#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import algoliasearch from "algoliasearch";
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from "quicktype-core";
import graphqlTypesFromJsonSchema from "./graphqlTypesFromJsonSchema";
import { JSONSchema6 } from "json-schema";
import { convert } from "@wittydeveloper/json-schema-to-graphql";

export interface Configuration {
  algoliaIndex: string;
  algoliaAppId: string;
  algoliaAdminApiKey: string;
  algoliaSearchApiKey: string;
  outputDir?: string;
  outputFileName?: string;
  searchQueryName?: string;
  fallbackTypes: Required<Parameters<typeof convert>>["1"]["fallbackTypes"];
}

const emitError = (error: Error) =>
  console.error(`Exited with errors: ${error}`);

async function quicktypeJSON(typeName: string, hits: any[]) {
  const jsonInput = jsonInputForTargetLanguage("JSON Schema");

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: hits.map((h) => JSON.stringify(h, null, 2)),
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return await quicktype({
    inputData,
    lang: "JSON Schema",
    inferUuids: false,
    inferEnums: false,
    inferMaps: false,
    inferDateTimes: false,
  });
}

const config: Configuration = JSON.parse(
  fs.readFileSync("./algolia-graphql.json", "utf-8")
);

const run = async () => {
  const client = algoliasearch(config.algoliaAppId, config.algoliaAdminApiKey);
  const index = client.initIndex(config.algoliaIndex);

  let hits: any[] = [];

  console.log(
    `Analyzing ${config.algoliaIndex} index (that might take a few seconds...)`
  );

  return index
    .browseObjects({
      query: "", // Empty query will match all records
      analytics: false,
      batch: (batch) => {
        hits = hits.concat(batch);
      },
    })
    .then(async () => {
      const { lines: productSchema } = await quicktypeJSON(
        "AlgoliaResultObject",
        hits
      );
      const schema: JSONSchema6 = JSON.parse(productSchema.join("\n"));
      const gqlTypes = graphqlTypesFromJsonSchema(schema, config);
      fs.writeFileSync(
        path.join(
          config.outputDir || ".",
          `${config.outputFileName || config.algoliaIndex}.graphql`
        ),
        gqlTypes
      );
      return `${config.outputFileName || config.algoliaIndex}.graphql created!`;
    }, emitError);
};

run().then(console.log, emitError);
