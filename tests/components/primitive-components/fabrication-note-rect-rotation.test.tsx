import { expect, test } from "bun:test"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("fabricationnoterect swaps width and height on a 90 degree rotated component", () => {
  const { circuit } = getTestFixture()

  circuit.add(
    <board width="20mm" height="20mm">
      <chip
        name="U1"
        pcbRotation={90}
        footprint={
          <footprint>
            <smtpad
              shape="rect"
              width="0.5mm"
              height="0.5mm"
              portHints={["pin1"]}
            />
            <silkscreenrect width="4mm" height="1mm" />
            <fabricationnoterect width="4mm" height="1mm" />
          </footprint>
        }
      />
    </board>,
  )

  circuit.render()

  const silkscreenRect = circuit.db.pcb_silkscreen_rect.list()[0]
  const fabricationNoteRect = circuit.db.pcb_fabrication_note_rect.list()[0]

  expect([silkscreenRect.width, silkscreenRect.height]).toEqual([1, 4])
  expect([fabricationNoteRect.width, fabricationNoteRect.height]).toEqual([
    1, 4,
  ])
})
