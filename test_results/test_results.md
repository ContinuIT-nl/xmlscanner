# Test Results

Results from `testreport.json` contains 5 testsuites with 30 tests:

## Summary

### Test Results

| ☑ Tests | ✅ Success | ❌ Failures/Errors | ⚠️ Skipped |
| ------: | --------: | ----------------: | ---------: |
|      30 |        30 |                 0 |          0 |
|         |           |                   |            |

### Code Coverage

| ☰ Lines | ᛘ Branches |
| ------: | ---------: |
|  100.0% |     100.0% |

## Detailed Test Results

| ✓✓ Test Suite              | ☑ Test                                  | State |
| -------------------------- | --------------------------------------- | ----- |
| `example.test.ts`          | example_names_only                      | ✅     |
| `example.test.ts`          | example_objects                         | ✅     |
| `unEntity.test.ts`         | unEntity                                | ✅     |
| `xmlAnalyser.test.ts`      | xmlAnalyser                             | ✅     |
| `xmlEventsBuilder.test.ts` | xmlEventBuilder-base                    | ✅     |
| `xmlEventsBuilder.test.ts` | xmlEventBuilder-specials                | ✅     |
| `xmlScanner.test.ts`       | xmlScanner-events                       | ✅     |
| `xmlScanner.test.ts`       | xmlScanner-performance                  | ✅     |
| `xmlScanner.test.ts`       | xml-declaration                         | ✅     |
| `xmlScanner.test.ts`       | comment                                 | ✅     |
| `xmlScanner.test.ts`       | cdata                                   | ✅     |
| `xmlScanner.test.ts`       | processing-instruction                  | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-no-closing-tag              | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-non-comment                 | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-no-root-element             | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-xmldeclaration-not-at-start | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-multiple-root-elements      | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-invalid-element-name        | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-unmatched-tag               | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-unquoted-attribute          | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-unclosed-attribute          | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-processing-instruction      | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-comment                     | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-cdata                       | ✅     |
| `xmlScanner.test.ts`       | invalid-xml-unknown-character           | ✅     |
| `xmlScanner.test.ts`       | special-characters                      | ✅     |
| `xmlScanner.test.ts`       | doctype-not-supported                   | ✅     |
| `xmlScanner.test.ts`       | emoticons                               | ✅     |
| `xmlScanner.test.ts`       | trailing-whitespace                     | ✅     |
| `xmlScanner.test.ts`       | unqoute                                 | ✅     |

## Detailed Code Coverage

| 🗎 File               | ☰ Lines | ᛘ Branches |
| :-------------------- | ------: | ---------: |
| `XmlParsingError.ts`  |  100.0% |            |
| `characterBits.ts`    |  100.0% |     100.0% |
| `unEntity.ts`         |  100.0% |     100.0% |
| `xmlAnalyser.ts`      |  100.0% |            |
| `xmlEventsBuilder.ts` |  100.0% |     100.0% |
| `xmlScanner.ts`       |  100.0% |     100.0% |
