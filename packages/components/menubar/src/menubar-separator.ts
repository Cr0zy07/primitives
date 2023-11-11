import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef } from '@oku-ui/use-composable'
import { OkuMenuSeparator } from '@oku-ui/menu'
import { MENUBAR_SEPARATOR_NAME, menubarSeparatorProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarSeparatorNativeElement } from './props'

const menubarSeparator = defineComponent({
  name: MENUBAR_SEPARATOR_NAME,
  components: {
    OkuMenuSeparator,
  },
  inheritAttrs: false,
  props: {
    ...menubarSeparatorProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarSeparatorProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...separatorProps
    } = toRefs(props)

    const _other = reactive(separatorProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuSeparator, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarSeparator = menubarSeparator as typeof menubarSeparator &
(new () => { $props: MenubarSeparatorNativeElement })
