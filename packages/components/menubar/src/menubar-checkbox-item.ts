import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuCheckboxItem } from '@oku-ui/menu'
import { MENUBAR_CHECKBOX_ITEM_NAME, menubarCheckboxItemProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarCheckboxItemNativeElement } from './props'

const menubarCheckboxItem = defineComponent({
  name: MENUBAR_CHECKBOX_ITEM_NAME,
  components: {
    OkuMenuCheckboxItem,
  },
  inheritAttrs: false,
  props: {
    ...menubarCheckboxItemProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarCheckboxItemProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...checkboxItemProps
    } = toRefs(props)

    const _other = reactive(checkboxItemProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuCheckboxItem, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarCheckboxItem = menubarCheckboxItem as typeof menubarCheckboxItem &
(new () => { $props: MenubarCheckboxItemNativeElement })
