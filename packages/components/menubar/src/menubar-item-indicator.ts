import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef } from '@oku-ui/use-composable'
import { OkuMenuItemIndicator } from '@oku-ui/menu'
import { MENUBAR_ITEM_INDICATOR_NAME, menubarItemIndicatorProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarItemIndicatorNativeElement } from './props'

const MenubarItemIndicator = defineComponent({
  name: MENUBAR_ITEM_INDICATOR_NAME,
  components: {
    OkuMenuItemIndicator,
  },
  inheritAttrs: false,
  props: {
    ...menubarItemIndicatorProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarItemIndicatorProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...itemIndicatorProps
    } = toRefs(props)

    const _other = reactive(itemIndicatorProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuItemIndicator, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarItemIndicator = MenubarItemIndicator as typeof MenubarItemIndicator &
(new () => { $props: MenubarItemIndicatorNativeElement })
