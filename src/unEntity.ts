const ENTITY_START = '&';
const ENTITY_END = ';';

/**
 * Decodes XML entities in a string.
 * If an invalid entity is encountered it is left unchanged in the result
 * @param value The string containing XML entities to decode.
 * @returns The decoded string.
 */
export const unEntity = (value: string): string => {
  // Start of the entity
  const entityStart = value.indexOf(ENTITY_START);
  if (entityStart === -1) return value;

  // End of the entity
  const entityEnd = value.indexOf(ENTITY_END, entityStart + 1);
  if (entityEnd === -1) return value;

  return unEntityInner(value, entityStart, entityEnd);
};

const entityMap: Map<string, string> = new Map([
  ['amp', '&'],
  ['quot', '"'],
  ['apos', "'"],
  ['lt', '<'],
  ['gt', '>'],
]);

const decodeNumericEntity = (entity: string): string => {
  const numericEntity = entity[1] === 'x' || entity[1] === 'X'
    ? Number.parseInt(entity.slice(2), 16)
    : Number.parseInt(entity.slice(1), 10);
  return String.fromCharCode(numericEntity);
};

// Process all entities. We know there is at least one.
const unEntityInner = (
  value: string,
  entityStart: number,
  entityEnd: number,
): string => {
  const result: string[] = entityStart > 0 ? [value.slice(0, entityStart)] : [];
  for (;;) {
    const entity = value.substring(entityStart + 1, entityEnd);
    result.push(
      entityMap.get(entity) ??
        (entity[0] === '#' ? decodeNumericEntity(entity) : value.substring(entityStart, entityEnd + 1)),
    );
    entityStart = value.indexOf('&', entityEnd + 1);
    if (entityStart === -1) {
      result.push(value.slice(entityEnd + 1));
      break;
    }
    const nextEntityEnd = value.indexOf(';', entityStart + 1);
    if (nextEntityEnd === -1) {
      result.push(value.slice(entityEnd + 1));
      break;
    }
    if (entityEnd + 1 < entityStart) {
      result.push(value.slice(entityEnd + 1, entityStart));
    }
    entityEnd = nextEntityEnd;
  }
  return result.join('');
};
