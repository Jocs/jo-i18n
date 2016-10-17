# 格式化指南

使用MessageFormat最简单的方案就是直接传一个字符串进去，而不进行任何格式化。这听起来似乎很愚蠢，但是通常情况下，我们使用消息格式系统来翻译一条消息，最后也返回的是相同消息，因此不是说有的翻译都依赖传入变量的。

```javascript
var mf = new MessageFormat('en');
var message = mf.compile('This is a message.');

message();
  // "This is a message."
```

**注意**：如果一条消息需要传入数据，但是在使用MessageFormat进行转换的时候没有传入数据时，系统将会抛出错误。

## Variables（变量）

除了上面描述的直接传入字符串，其次使用MessageFormat最简单的方法就是变量替换了。MessageFormat一开始可能显得比较奇怪，但是使用起来相当简单。我们可以这样理解`{`和`}`：每次当我们使用这一对括号时，它都将我们带入、带出字面量和代码模式。

默认情况下（比如下面一个例子），你仅仅书写一句字面量表达式，用大括号标示变量名，剩下的就是最简单的变量替换了。

将变量名置于括号之间，当输出时就会通过传入的参数去替换括号中的变量。

```
var mf = new MessageFormat('en');
var varMessage = mf.compile('His name is {NAME}.');

varMessage({ NAME : "Jed" });
  // "His name is Jed."
```

## SelectFormat（选择格式化）

`SelectFormat`类似于switch 语句，SelectFormat通常用于在字符串中选择性别。格式化的语法如下：

>  {varname, select,thisvalue{...} thatvalue{...} other{...}}

`varname`用来匹配传入结果函数中对象的键名，`'thisvalue'`&`'thatwvalue'`就是用来和输入的键值进行相等比较，如果相等，将输出大括号中的字符串，`other`是必须的，当进行相等比较都不匹配后，将输出other大括号内的值。

需要注意的是，做相等比较的时候使用的是JavaScript中的`==`操作符，所以当我们在调用结果函数传入一个空对象时，实际上相当于`undefined{...}`去进行比较的。

```
var mf = new MesssageFormat('en');
var selectMessage = mf.compile(
  '{GENDER, select, male{He} female{She} other{They}} liked this.'
);

selectMessage({ GENDER: 'male' });
  // "He liked this."

selectMessage({ GENDER: 'female' });
  // "She liked this."

selectMessage({});
  // "They liked this."
```

## PluralFormat（复数格式化）

`PluralFormat`和`SelectFormat`的执行机制差不多，但是主要用于数字值的转换。所选择的键名由指定的输入变量通过特定语言环境的复数函数决定。

数值输入和复数分类中的每一项一一对应，根据语言环境和复数类型的不同，复数分类又有不同子类，如`zero`、`one`、`two` 、`few`、`many`和`other`。比如在英语中，单复数的分类规则如下，使用`one`、`other`来对基数复数类型进行分类（one result, many results）使用`one`,`two`,`few`和`other`来对序数复数进行分类（1st result, 2nd result, etc）。有关您所在语言环境使用那些键来设置分类表，请参考[单复数规则CLDR表](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)。

通过`=`前缀来匹配准确的数值。

基数复数的关键字是`plural`，序数复数的关键字是`selectordinal`。

在一个复数语句中，当`compile`函数执行后，`#`占位符将被替换为结果函数传递进来的变量值。

```javascript
var mf = new MessageFormat('en');
var pluralMessage = mf.compile(
  'There {NUM_RESULTS, plural, =0{are no results} one{is one result} other{are # results}}.'
);

pluralMessage({ NUM_RESULTS: 0 });
  // "There are no results."

pluralMessage({ NUM_RESULTS: 1 });
  // "There is one result."

pluralMessage({ NUM_RESULTS: 100 });
  // "There are 100 results."
```

#### Offset extension

To generate sentences such as “You and 4 others added this to their profiles.”, PluralFormat supports adding an `offset` to the variable value before determining its plural category. Literal/exact matches are tested before applying the offset.

如果需要生成如下形式的语句：“You and 4 others added this to their profiles.”，PluralFormat（复数格式化）支持在决定复数类型前为变量值添加一个`offset`参数，在应用偏移参数之前测试字面量/精确值的匹配。

```javascript
var mf = new MessageFormat('en');

var offsetMessage = mf.compile(
  'You {NUM_ADDS, plural, offset:1' +
    '=0{did not add this}' +
    '=1{added this}' +
    'one{and one other person added this}' +
    'other{and # others added this}' +
  '}.'
);

offsetMessage({ NUM_ADDS: 0 });
  // "You did not add this."

offsetMessage({ NUM_ADDS: 1 });
  // "You added this."

offsetMessage({ NUM_ADDS: 2 });
  // "You and one other person added this."

offsetMessage({ NUM_ADDS: 3 });
  // "You and 2 others added this."
```

## Intl Formatters（国际化格式化）

MessageFormat也包括了日期、数字和时间的格式化方法，这些方法都采用了ICU标准的 [simpleArg syntax](http://icu-project.org/apiref/icu4j/com/ibm/icu/text/MessageFormat.html)语法格式，这些方法的实现采用了ECMA-402标准中定义的 [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) 对象。

**注意：**Node0.11.15 / 0.12.0 版本之前都没有定义国际化内容，并且所有浏览器也不支持国际化，因此你需要使用 [polyfill](https://www.npmjs.com/package/intl)。

因为原生或者polyfill都没有保证，因此你需要在MessageFormat实例对象上调用`setIntlSupport()`方法来确保国际化格式化的使用。

### date（日期）

支持如下参数：'short','default','long', 或者'full'。

```javascript
var mf = new MessageFormat(['en', 'fi']).setIntlSupport(true);

mf.compile('Today is {T, date}')({ T: Date.now() })
// 'Today is Feb 21, 2016'

mf.compile('Tänään on {T, date}', 'fi')({ T: Date.now() })
// 'Tänään on 21. helmikuuta 2016'

mf.compile('Unix time started on {T, date, full}')({ T: 0 })
// 'Unix time started on Thursday, January 1, 1970'

var cf = mf.compile('{sys} became operational on {d0, date, short}');
cf({ sys: 'HAL 9000', d0: '12 January 1999' })
// 'HAL 9000 became operational on 1/12/1999'
```

### number（数字）

支持如下参数：'integer','percent'或者'currency'。

```javascript
var mf = new MessageFormat('en').setIntlSupport(true);
mf.currency = 'EUR';  // needs to be set before first compile() call

mf.compile('{N} is almost {N, number, integer}')({ N: 3.14 })
// '3.14 is almost 3'

mf.compile('{P, number, percent} complete')({ P: 0.99 })
// '99% complete'

mf.compile('The total is {V, number, currency}.')({ V: 5.5 })
// 'The total is €5.50.'
```

### time（时间）

支持如下参数'short','default','long'或者'full'。

```javascript
var mf = new MessageFormat(['en', 'fi']).setIntlSupport(true);

mf.compile('The time is now {T, time}')({ T: Date.now() })
// 'The time is now 11:26:35 PM'

mf.compile('Kello on nyt {T, time}', 'fi')({ T: Date.now() })
// 'Kello on nyt 23.26.35'

var cf = mf.compile('The Eagle landed at {T, time, full} on {T, date, full}');
cf({ T: '1969-07-20 20:17:40 UTC' })
// 'The Eagle landed at 10:17:40 PM GMT+2 on Sunday, July 20, 1969'
```

## Custom Formatters（自定义格式化）

MessageFormat库支持自定义格式化。通过调用MessageFormat实例对象上面的`addFormaters()`方法，`addFormaters()`方法接受一个键值对对象，键名是自定义转化的方法名，键值就是转换时的回调方法，其接受三个参数：变量值、当前语言环境以及一个参数数组。自定义格式化下面的语法格式使用：`{var, yourFormatterName, arg1, arg2}`。

```javascript
var mf = new MessageFormat('en-GB');
mf.addFormatters({
  upcase: function(v) { return v.toUpperCase(); },
  locale: function(v, lc) { return lc; },
  prop: function(v, lc, p) { return v[p] }
});

mf.compile('This is {VAR, upcase}.')({ VAR: 'big' })
// 'This is BIG.'

mf.compile('The current locale is {_, locale}.')({ _: '' })
// 'The current locale is en-GB.'

mf.compile('Answer: {obj, prop, a}')({ obj: {q: 3, a: 42} })
// 'Answer: 42'
```

## Nesting（嵌套）

不同信息格式化类型都可以相互嵌套，并且没有嵌套层数限制：

```javascript
{SEL1, select,
  other {
    {PLUR1, plural,
      one {1}
      other {
        {SEL2, select,
          other {Deep in the heart.}
        }
      }
    }
  }
}
```

## Escaping（转义）

如果我们想在输出的字符串中中包含`{`和`}`字符，需要通过`\`对这些符号进行转义。在单复数格式化语句中，如果我们想输出`#`符号，也需要进行相同的转义处理。还有一点需要提醒，在JavaScript和JSON字符串中我们需要使用`\\`符号进行双重转义。