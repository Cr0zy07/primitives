import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuSubTrigger } from '@oku-ui/menu'
import { MENUBAR_SUB_TRIGGER_NAME, menubarSubTriggerProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarSubTriggerNativeElement } from './props'

const menubarSubTrigger = defineComponent({
  name: MENUBAR_SUB_TRIGGER_NAME,
  components: {
    OkuMenuSubTrigger,
  },
  inheritAttrs: false,
  props: {
    ...menubarSubTriggerProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarSubTriggerProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...triggerItemProps
    } = toRefs(props)

    const _other = reactive(triggerItemProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuSubTrigger, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarSubTrigger = menubarSubTrigger as typeof menubarSubTrigger &
(new () => { $props: MenubarSubTriggerNativeElement })
