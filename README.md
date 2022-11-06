## 背景
平时接口返回的数据，可能会有冗余或后期不断迭代与原有字段已改名

所以想用一种更直观的方式来映射转换数据

`dataTransform(data, pattern)` 由此由来。 data 为原数据、 pattern 为映射模式，
按照 pattern 的形状进行填充数据, 属性的值为 data 中的 path, 从而拿到 `data[path]` 中的值填充。

当然有的时候是想填充真正的`字面量`值, 此时只需要用 `Value('aaa')` 就可拿到 `'aaa'` 

当然还有更多的功能，如： `Origin` 、 `Remove`、 `Retain`、 `Value` 来方便映射，
导出的 api 十分简单， 源代码也只有 90 行。

### 结构提取数组中的值

```JavaScript
import { dataTransform, Origin } from "@aimwhy/transform-data";

console.log(
  dataTransform(
    {
      a: 44,
      e: [
        { a: 'a', b: 'b' },
        { a: 'a1', b: 'b1' },
        { a: 'a2', b: 'b2' },
      ],
    },
    {
      e2: ['a', Origin, 'e'], // 参考原数据 path 为 'e' 指向的数据
    }
  );
);

// { e2: [ 'a', 'a1', 'a2' ] }
```

### 导出的字段

| export               | description |  type |  dep |
| ------------------- | ----------- | -------- | -----|
| `Origin`    | 指向原数据的 `path` | string | -  |
| `Remove`    | 移除的属性 「参考 Origin 指向的对象」 | string[]  | `Origin` |
| `Retain`    | 保留的属性 「参考 Origin 指向的对象」 | string[]  | `Origin` |
| `Value`     | 直接生成具体值 | function |  - |
| `dataTransform` | 转换函数  | function |  - |

### 重命名 Key

```JavaScript
import { dataTransform } from "@aimwhy/transform-data";

console.log(
  dataTransform(
    {
      a: '1',
      b: '2',
      c: '3'
    },
    {
      a1: 'a',
      b1: 'b',
      c1: 'c'
    }
  )
);
// { a1: '1', b1: '2', c1: '3' }
```

```JavaScript
import { dataTransform, Retain, Value } from "@aimwhy/transform-data";

console.log(
  dataTransform(
    {
      a: '1',
      b: '2',
      c: '3',
      f: [2, 3],
      g: { g1: {g11: 'g11'}, g2: {g22: 'g22'}, g3: {g33: 'g33'} }
    },
    {
      b1: 'b',
      c1: Value('c'), // 使用传入的值作为最终值，而非模式
      x: { [Origin]: 'g', [Retain]: ['g1'], ff: 'g2.g22'}, // 参考 ’g‘ 指向的数据生成
      y: (record) => record['g.g3.g33'] + record['a']  // 用函数自己生成，record 为原数据各层 path 的记录
    }
  )
);
// { b1: '2', c1: 'c', x: { g1: { g11: 'g11' }, ff: 'g22' }, y: 'g331' }
```

## 让数据映射转换 更直观