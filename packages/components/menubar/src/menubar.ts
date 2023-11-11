import { computed, defineComponent, h, mergeProps, reactive, ref, toRefs, useModel } from 'vue'
import { Primitive } from '@oku-ui/primitive'
import { useDirection } from '@oku-ui/direction'
import { reactiveOmit, useControllable, useForwardRef } from '@oku-ui/use-composable'
import { OkuRovingFocusGroup } from '@oku-ui/roving-focus'
import { CollectionProvider, CollectionSlot, MENUBAR_NAME, menubarProps, menubarProvider, scopedMenubarProps, useRovingFocusGroupScope } from './props'

const menubar = defineComponent({
  name: MENUBAR_NAME,
  components: {
    OkuRovingFocusGroup,
  },
  inheritAttrs: false,
  props: {
    ...menubarProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarProps.emits,
  setup(props, { attrs, emit, slots }) {
    const {
      scopeOkuMenubar,
      value: valueProp,
      defaultValue,
      loop,
      dir,
      ..._menubarProps
    } = toRefs(props)

    const _other = reactive(_menubarProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const direction = useDirection(dir)
    const rovingFocusGroupScope = useRovingFocusGroupScope(scopeOkuMenubar.value)

    const modelValue = useModel(props, 'modelValue')
    const proxyChecked = computed({
      get: () => modelValue.value !== undefined ? modelValue.value : valueProp.value !== undefined ? valueProp.value : undefined,
      set: () => {
      },
    })

    const { state, updateValue } = useControllable({
      prop: computed(() => proxyChecked.value),
      defaultProp: computed(() => defaultValue.value),
      onChange: (result: any) => {
        modelValue.value = result
        emit('valueChange', result)
        emit('update:modelValue', result)
      },
      initialValue: '',
    })

    // We need to manage tab stop id manually as `RovingFocusGroup` updates the stop
    // based on focus, and in some situations our triggers won't ever be given focus
    // (e.g. click to open and then outside to close)
    const currentTabStopId = ref<string | null>(null)

    menubarProvider({
      scope: scopeOkuMenubar.value,
      value: computed(() => state.value),
      onMenuOpen: (_value) => {
        updateValue(_value)
        currentTabStopId.value = _value
      },
      onMenuClose: () => updateValue(''),
      onMenuToggle: (_value) => {
        updateValue((state.value ? '' : _value))
        // `openMenuOpen` and `onMenuToggle` are called exclusively so we
        // need to update the id in either case.
        currentTabStopId.value = _value
      },
      dir: direction,
      loop,
    })

    return () => h(CollectionProvider, { scope: scopeOkuMenubar.value }, h(CollectionSlot, { scope: scopeOkuMenubar.value }, h(OkuRovingFocusGroup, {
      asChild: true,
      ...rovingFocusGroupScope,
      orientation: 'horizontal',
      loop: loop.value,
      dir: direction.value,
      currentTabStopId: currentTabStopId.value,
      onCurrentTabStopIdChange: tabStopId => currentTabStopId.value = tabStopId,
    }, h(Primitive.div, {
      role: 'menubar',
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots))))
  },
})

export const OkuMenubar = menubar
