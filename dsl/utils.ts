export const norm = <T>(query: T) =>
  (query == null
    ? []
    : Array.isArray(query)
    ? query
    : [query]) as T extends any[] ? T : T[];

type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;
type AbstractConstructorGroup<T = any> = AbstractConstructor<T>[];

export const member = {
  is: <T, Grouping extends AbstractConstructorGroup[]>(
    query: T,
    ...groups: Grouping
  ): query is InstanceType<Grouping[number][number]> => {
    for (const group of groups)
      for (const C of group) if (query instanceof C) return true;
    return false;
  },
  assert: <T, Grouping extends AbstractConstructorGroup[]>(
    query: T,
    ...groups: Grouping
  ): asserts query is InstanceType<Grouping[number][number]> => {
    if (!member.is(query, ...groups))
      throw new TypeError("Member assertion failed");
  },
  filter: <T, Grouping extends AbstractConstructorGroup[]>(
    query: T[],
    ...groups: Grouping
  ): InstanceType<Grouping[number][number]>[] =>
    query.filter((q): q is InstanceType<Grouping[number][number]> =>
      member.is(q, ...groups)
    ),
  annotate: <T, Grouping extends AbstractConstructorGroup[]>(
    query: T[],
    ...groups: Grouping
  ): (
    | { matched: true; item: InstanceType<Grouping[number][number]> }
    | { matched: false; item: T }
  )[] =>
    query.map((item) =>
      member.is(item, ...groups)
        ? { matched: true, item }
        : { matched: false, item }
    ),
};
