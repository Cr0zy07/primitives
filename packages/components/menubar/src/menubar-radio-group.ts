import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuRadioGroup } from '@oku-ui/menu'
import { MENUBAR_RADIO_GROUP_NAME, menubarRadioGroupProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarRadioGroupNativeElement } from './props'

const menubarRadioGroup = defineComponent({
  name: MENUBAR_RADIO_GROUP_NAME,
  components: {
    OkuMenuRadioGroup,
  },
  inheritAttrs: false,
  props: {
    ...menubarRadioGroupProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarRadioGroupProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...radioGroupProps
    } = toRefs(props)

    const _other = reactive(radioGroupProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuRadioGroup, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarRadioGroup = menubarRadioGroup as typeof menubarRadioGroup &
(new () => { $props: MenubarRadioGroupNativeElement })
