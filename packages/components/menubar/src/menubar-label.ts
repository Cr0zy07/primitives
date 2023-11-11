import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef } from '@oku-ui/use-composable'
import { OkuMenuLabel } from '@oku-ui/menu'
import { MENUBAR_LABEL_NAME, menubarLabelProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarLabelNativeElement } from './props'

const menubarLabel = defineComponent({
  name: MENUBAR_LABEL_NAME,
  components: {
    OkuMenuLabel,
  },
  inheritAttrs: false,
  props: {
    ...menubarLabelProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarLabelProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...labelProps
    } = toRefs(props)

    const _other = reactive(labelProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuLabel, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarLabel = menubarLabel as typeof menubarLabel &
(new () => { $props: MenubarLabelNativeElement })
