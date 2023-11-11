import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuSubContent } from '@oku-ui/menu'
import { MENUBAR_SUB_CONTENT_NAME, menubarSubContentProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarSubContentNativeElement } from './props'

const menubarSubContent = defineComponent({
  name: MENUBAR_SUB_CONTENT_NAME,
  components: {
    OkuMenuSubContent,
  },
  inheritAttrs: false,
  props: {
    ...menubarSubContentProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarSubContentProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...subContentProps
    } = toRefs(props)

    const _other = reactive(subContentProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuSubContent, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
      style: {
        ...attrs.style as any,
        // re-namespace exposed content custom properties
        ...{
          '--oku-menubar-content-transform-origin': 'var(--oku-popper-transform-origin)',
          '--oku-menubar-content-available-width': 'var(--oku-popper-available-width)',
          '--oku-menubar-content-available-height': 'var(--oku-popper-available-height)',
          '--oku-menubar-trigger-width': 'var(--oku-popper-anchor-width)',
          '--oku-menubar-trigger-height': 'var(--oku-popper-anchor-height)',
        },
      },
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarSubContent = menubarSubContent as typeof menubarSubContent &
(new () => { $props: MenubarSubContentNativeElement })
