import type { ComponentPropsWithoutRef } from '@oku-ui/primitive'
import { usePrevious } from '@oku-ui/use-composable'
import { clamp } from '@oku-ui/utils'
import { h, ref, watch } from 'vue'

function BubbleInput(props: ComponentPropsWithoutRef<'input'>) {
  const { value, ...inputProps } = props
  const inputRef = ref<HTMLInputElement | null>(null)
  const prevValue = usePrevious(value)

  // Bubble value change to parents (e.g form change event)
  watch([prevValue, value], ([prev, current]) => {
    const input = inputRef.value!
    const inputProto = window.HTMLInputElement.prototype
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, 'value') as PropertyDescriptor
    const setValue = descriptor.set
    if (prev !== current && setValue) {
      const event = new Event('input', { bubbles: true })
      setValue.call(input, current)
      input.dispatchEvent(event)
    }
  })

  /**
   * We purposefully do not use `type="hidden"` here otherwise forms that
   * wrap it will not be able to access its value via the FormData API.
   *
   * We purposefully do not add the `value` attribute here to allow the value
   * to be set programatically and bubble to any parent form `onChange` event.
   * Adding the `value` will cause React to consider the programatic
   * dispatch a duplicate and it will get swallowed.
   */
  // return <input style={ { display: 'none' } } {...inputProps } ref = { ref } defaultValue = { value } />;
  return () => h('input', {
    style: { display: 'none' },
    ...inputProps,
    ref: inputRef,
    defaultValue: value,
  })
}

function getNextSortedValues(prevValues: number[] = [], nextValue: number, atIndex: number) {
  const nextValues = [...prevValues]
  nextValues[atIndex] = nextValue
  return nextValues.sort((a, b) => a - b)
}

function convertValueToPercentage(value: number, min: number, max: number) {
  const maxSteps = max - min
  const percentPerStep = 100 / maxSteps
  const percentage = percentPerStep * (value - min)
  return clamp(percentage, [0, 100])
}

/**
 * Returns a label for each thumb when there are two or more thumbs
 */
function getLabel(index: number, totalValues: number) {
  if (totalValues > 2)
    return `Value ${index + 1} of ${totalValues}`

  else if (totalValues === 2)
    return ['Minimum', 'Maximum'][index]

  else
    return undefined
}

/**
 * Given a `values` array and a `nextValue`, determine which value in
 * the array is closest to `nextValue` and return its index.
 *
 * @example
 * // returns 1
 * getClosestValueIndex([10, 30], 25);
 */
function getClosestValueIndex(values: number[], nextValue: number) {
  if (values.length === 1)
    return 0
  const distances = values.map(value => Math.abs(value - nextValue))
  const closestDistance = Math.min(...distances)
  return distances.indexOf(closestDistance)
}

/**
 * Offsets the thumb centre point while sliding to ensure it remains
 * within the bounds of the slider when reaching the edges
 */
function getThumbInBoundsOffset(width: number, left: number, direction: number) {
  const halfWidth = width / 2
  const halfPercent = 50
  const offset = linearScale([0, halfPercent], [0, halfWidth])
  return (halfWidth - offset(left) * direction) * direction
}

/**
 * Gets an array of steps between each value.
 *
 * @example
 * // returns [1, 9]
 * getStepsBetweenValues([10, 11, 20]);
 */
function getStepsBetweenValues(values: number[]) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value)
}

/**
 * Verifies the minimum steps between all values is greater than or equal
 * to the expected minimum steps.
 *
 * @example
 * // returns false
 * hasMinStepsBetweenValues([1,2,3], 2);
 *
 * @example
 * // returns true
 * hasMinStepsBetweenValues([1,2,3], 1);
 */
function hasMinStepsBetweenValues(values: number[], minStepsBetweenValues: number) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values)
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues)
    return actualMinStepsBetweenValues >= minStepsBetweenValues
  }
  return true
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1])
      return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }
}

function getDecimalCount(value: number) {
  return (String(value).split('.')[1] || '').length
}

function roundValue(value: number, decimalCount: number) {
  const rounder = 10 ** decimalCount
  return Math.round(value * rounder) / rounder
}

export { BubbleInput, getNextSortedValues, convertValueToPercentage, getLabel, getClosestValueIndex, getThumbInBoundsOffset, linearScale, hasMinStepsBetweenValues, getDecimalCount, roundValue }
