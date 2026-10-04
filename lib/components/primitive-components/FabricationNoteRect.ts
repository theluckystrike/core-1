import { fabricationNoteRectProps } from "@tscircuit/props"
import { decomposeTSR } from "transformation-matrix"
import { PrimitiveComponent } from "../base-components/PrimitiveComponent"

export class FabricationNoteRect extends PrimitiveComponent<
  typeof fabricationNoteRectProps
> {
  fabrication_note_rect_id: string | null = null
  isPcbPrimitive = true

  get config() {
    return {
      componentName: "FabricationNoteRect",
      zodProps: fabricationNoteRectProps,
    }
  }

  /**
   * Check if the component is rotated 90 or 270 degrees based on global transform.
   * For these rotations, we need to swap width/height instead of using ccw_rotation.
   */
  private _isRotated90Degrees(): boolean {
    const globalTransform = this._computePcbGlobalTransformBeforeLayout()
    const decomposedTransform = decomposeTSR(globalTransform)
    const rotationDegrees = (decomposedTransform.rotation.angle * 180) / Math.PI
    const normalizedRotationDegrees = ((rotationDegrees % 360) + 360) % 360
    const rotationTolerance = 0.01

    return (
      Math.abs(normalizedRotationDegrees - 90) < rotationTolerance ||
      Math.abs(normalizedRotationDegrees - 270) < rotationTolerance
    )
  }

  doInitialPcbPrimitiveRender(): void {
    if (this.root?.pcbDisabled) return
    const { db } = this.root!
    const { _parsedProps: props } = this
    const position = this._getGlobalPcbPositionBeforeLayout()
    const { maybeFlipLayer } = this._getPcbPrimitiveFlippedHelpers()

    const layer = maybeFlipLayer(props.layer ?? "top") as "top" | "bottom"
    if (layer !== "top" && layer !== "bottom") {
      throw new Error(
        `Invalid layer "${layer}" for FabricationNoteRect. Must be "top" or "bottom".`,
      )
    }

    const pcb_component_id =
      this.parent?.pcb_component_id ??
      this.getPrimitiveContainer()?.pcb_component_id!

    const subcircuit = this.getSubcircuit()

    const hasStroke =
      props.hasStroke ??
      (props.strokeWidth !== undefined && props.strokeWidth !== null)

    const isRotated90Degrees = this._isRotated90Degrees()
    const finalWidth = isRotated90Degrees ? props.height : props.width
    const finalHeight = isRotated90Degrees ? props.width : props.height

    const fabrication_note_rect = db.pcb_fabrication_note_rect.insert({
      pcb_component_id,
      layer,
      color: props.color,

      center: {
        x: position.x,
        y: position.y,
      },
      width: finalWidth,
      height: finalHeight,
      stroke_width: props.strokeWidth ?? 1,
      is_filled: props.isFilled ?? false,
      has_stroke: hasStroke,
      is_stroke_dashed: props.isStrokeDashed ?? false,
      subcircuit_id: subcircuit?.subcircuit_id ?? undefined,
      pcb_group_id: this.getGroup()?.pcb_group_id ?? undefined,
      corner_radius: props.cornerRadius ?? undefined,
    })

    this.fabrication_note_rect_id =
      fabrication_note_rect.pcb_fabrication_note_rect_id
  }

  getPcbSize(): { width: number; height: number } {
    const { _parsedProps: props } = this
    if (this._isRotated90Degrees()) {
      return { width: props.height, height: props.width }
    }
    return { width: props.width, height: props.height }
  }

  _moveCircuitJsonElements({
    deltaX,
    deltaY,
  }: { deltaX: number; deltaY: number }) {
    if (this.root?.pcbDisabled) return
    const { db } = this.root!
    if (!this.fabrication_note_rect_id) return

    const rect = db.pcb_fabrication_note_rect.get(this.fabrication_note_rect_id)

    if (rect) {
      db.pcb_fabrication_note_rect.update(this.fabrication_note_rect_id, {
        center: {
          x: rect.center.x + deltaX,
          y: rect.center.y + deltaY,
        },
      })
    }
  }
}
