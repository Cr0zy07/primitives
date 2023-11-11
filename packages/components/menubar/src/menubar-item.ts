import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuItem } from '@oku-ui/menu'
import { MENUBAR_ITEM_NAME, menubarItemProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarItemNativeElement } from './props'

const menubarItem = defineComponent({
  name: MENUBAR_ITEM_NAME,
  components: {
    OkuMenuItem,
  },
  inheritAttrs: false,
  props: {
    ...menubarItemProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarItemProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...itemProps
    } = toRefs(props)

    const _other = reactive(itemProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuItem, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarItem = menubarItem as typeof menubarItem &
(new () => { $props: MenubarItemNativeElement })
