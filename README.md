![](http://content-management.b0.upaiyun.com/1476434640674.png)

# jo-i18n

**jo-i18n**是基于[messageformat](https://github.com/messageformat/messageformat.js)之上构建的国际化解决方案，得益于messageformat的优良特性，jo-i18n支持[Unicode CLDR](http://cldr.unicode.org/)标准中的所有[语言](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)，能够帮助你处理**单复数**、**日期**和**性别**等语言翻译问题。

ICU标准提供了关于单复数、日期、性别等格式化的官方指导，除了被遗弃的**ChoiceFormat**，**jo-i18n**支持标准中的所有格式语法，同时**jo-i18n**提供了对语言标签(language tags)的检验，在BCP 47，保证了语言标签的准确合规。

#### jo-i18n能帮您解决什么问题？

通过**jo-i18n**，你可以做到业务代码和语言格式化（翻译）松耦合，也就是说，我们只需要对现有的代码进行极小的改动就能够是我们的应用变成国际化应用。

#### 安装jo-i18n

> npm install jo-i18n

#### 简单的使用

```html
<html>
  	<!--设置语言为en，如果没有设置，jo-i18n将从环境中读取当前所选语言-->
	<meta http-equiv="Content-Language" content="en">
</html>
```

```javascript
// dist.js
const msg =
  '{GENDER, select, male{He} female{She} other{They} }' +
  ' found ' +
  '{RES, plural, =0{no results} one{1 result} other{# results} }' +
  ' in the ' +
  '{CAT, selectordinal, one{#st} two{#nd} few{#rd} other{#th} }' +
  ' category.';

export default const dist = {
  'en': {
    'TOTAL_ITEM': msg
  }
}

// index.js
import { extendDict, __ } from 'jo-i18n'
import dist from './dist'

extendDist(dist)

__('TOTAL_ITEM', { GENDER: 'male', RES: 1, CAT: 2 })
// 'He found 1 result in the 2nd category.'
__('TOTAL_ITEM', { GENDER: 'female', RES: 1, CAT: 2 }) 
// 'She found 1 result in the 2nd category.'
__('TOTAL_ITEM', { RES: 2, CAT: 2 }) 
// 'They found 2 results in the 2nd category.'
```

上面的简单实例展示了jo-i18n在处理性别、单复数和序数等问题的格式化。[更多格式语法](https://messageformat.github.io/guide/)

#### 结合其他框架

**Angular**

**jo-i18n**目前很好得支持Angular框架，项目提供了`translateProvider`方法为你轻松创建国际化翻译指令。

```javascript
// translate.js
import angular from 'angular';
import { translateProvider } from 'jo-i18n';

export default translateProvider(angular, 'yourTranslate');
// index.js
import yourTranslate from './translate'
angular.module('App', [yourTranslate])
```

如上您就可以在你的模板中使用yourTranslate指令了。

```html
<div your-translate>我住在上海<span notranslate>我不会被翻译</span></div>
```

注：需要把需要翻译的字段通过`extendDict`方法添加到字典表中。

```javascript
extendDict({'en': {
  '我住在上海': 'I live in Shanghai'
}})
```

#### MIT License