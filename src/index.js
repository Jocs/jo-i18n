/**
 * create by Jocs 2016-10-12
 */
import MessageFormat from 'messageformat'

const initDict = {}

const getMetaLanguage = () => {
	const metas = document.getElementsByTagName('META')
	const langMeta = [...metas].filter(m => m.getAttribute('http-equiv') === 'Content-Language')[0]
	return langMeta && langMeta.getAttribute('content') || false
}

const locale = getMetaLanguage() || window.navigator.language || 'zh-CN'

export const extendDict = dict => {
	Object.keys(dict).forEach(k => {
		k in initDict ? Object.assign(initDict[k], dict[k]) : initDict[k] = dict[k]
	})
}

export const __ = (...params) => {
	if (typeof params[0] !== 'string') console.error('‘__’函数第一个参数接受一个字符串作为字典匹配键名。')
	switch (params.length) {
		// 当传入一个参数时，将该参数作为key,根据当前环境语言直接调用字典翻译，如果字典中没有对应值，返回传入值。
		case 1: {
			return initDict[locale][params[0]] || params[0]
		}
		// 当传入两个参数，第一个参数是匹配字典字段的键名，第二个参数是MessageFormat结果函数接受的键值对。
		case 2: {
			const mf = new MessageFormat(locale)
			const messageProvider = mf.compile(initDict[locale][params[0]])
			return messageProvider(params[1])
		}
		default: return console.error('输入参数个数有误，‘__’函数只接受一到两个参数。')
	}
}

export const translateProvider = (angular, name) => {
	const getTexts = ele => {
		const result = [];
		(function getNodes(element) {
			const childNodes = element.childNodes;
			if (childNodes.length !== 0) {
				childNodes.forEach(c => {
					if ((c.nodeType === 3 && /\S/.test(c.nodeValue)) || (c.tagName === 'INPUT' && !c.hasAttribute('notranslate'))) result.push(c);
					if (c.nodeType === 1 && !c.hasAttribute('notranslate')) getNodes(c);
				});
			}
		})(ele);
		return result;
	};

	TranslateCtrl.$inject = ['$element'];
	function TranslateCtrl($element) {
		const handler = () => {
			const textNodes = getTexts($element[0]);
			textNodes.forEach(t => {
				if (t.tagName && t.tagName === 'INPUT') {
					t.value = __(t.value);
				} else t.nodeValue = __(t.nodeValue);
			});
		};
		this.$doCheck = handler;
	}

	return angular.module('components[name]', [])
		.directive(name, () => ({
			restrict: 'A',
			controller: TranslateCtrl
		}))
		.name;
}
