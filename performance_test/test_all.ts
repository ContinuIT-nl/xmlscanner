import { junit_tests } from './test_junit.ts';
import { perform_tests as ucd_tests } from './test_ucd.ts';

async function test_all_tests() {
  await ucd_tests();
  await junit_tests();
}

await test_all_tests();
