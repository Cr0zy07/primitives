import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef } from '@oku-ui/use-composable'
import { OkuMenuGroup } from '@oku-ui/menu'
import { MENUBAR_GROUP_NAME, menubarGroupProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarGroupNativeElement } from './props'

const menubarGroup = defineComponent({
  name: MENUBAR_GROUP_NAME,
  components: {
    OkuMenuGroup,
  },
  inheritAttrs: false,
  props: {
    ...menubarGroupProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarGroupProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...groupProps
    } = toRefs(props)

    const _other = reactive(groupProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuGroup, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarGroup = menubarGroup as typeof menubarGroup &
(new () => { $props: MenubarGroupNativeElement })
