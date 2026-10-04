import { expect, test } from "bun:test"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("panel grid layout respects asymmetric edge padding", () => {
  const { circuit } = getTestFixture()

  circuit.add(
    <panel
      layoutMode="grid"
      edgePaddingLeft={20}
      edgePaddingRight={0}
      edgePaddingTop={2}
      edgePaddingBottom={8}
    >
      <board width="10mm" height="10mm" routingDisabled />
      <board width="10mm" height="10mm" routingDisabled />
    </panel>,
  )

  circuit.render()

  const panel = circuit.db.pcb_panel.list()[0]!
  const boards = circuit.db.pcb_board.list()

  const panelLeft = panel.center.x - panel.width / 2
  const panelRight = panel.center.x + panel.width / 2
  const panelTop = panel.center.y + panel.height / 2
  const panelBottom = panel.center.y - panel.height / 2

  const boardsLeft = Math.min(...boards.map((b) => b.center.x - b.width! / 2))
  const boardsRight = Math.max(...boards.map((b) => b.center.x + b.width! / 2))
  const boardsTop = Math.max(...boards.map((b) => b.center.y + b.height! / 2))
  const boardsBottom = Math.min(
    ...boards.map((b) => b.center.y - b.height! / 2),
  )

  expect(boardsLeft - panelLeft).toBeCloseTo(20)
  expect(panelRight - boardsRight).toBeCloseTo(0)
  expect(panelTop - boardsTop).toBeCloseTo(2)
  expect(boardsBottom - panelBottom).toBeCloseTo(8)

  expect(circuit).toMatchPcbSnapshot(import.meta.path)
})
