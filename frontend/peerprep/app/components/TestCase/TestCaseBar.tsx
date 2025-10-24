import { Button } from "@mantine/core";
import classes from "./TestCase.module.css";
import { useRef, useEffect, useState } from "react";

export default function TestCaseBar() {
    const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const TestCases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Example test case numbers

  //  container scroll when mouse wheel scrolls
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollTo({
        left: container.scrollLeft + e.deltaY,
        behavior: "smooth",
      });
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <div className={classes.TestCaseBar}>
        <div className={classes.TestCaseContainer} ref={containerRef}>
          {TestCases.map((testCase) => (
            <Button
              key={testCase}
              size="compact-md"
              classNames={{ root: classes.CaseButton }}
              c={"white"}
              style={{ backgroundColor: selectedCase === testCase ? "var(--mantine-color-dark-7)" : "var(--mantine-color-dark-6)" }}
              onClick={() => setSelectedCase(testCase)}
            >

              <span style={{ color: "var(--mantine-color-green-5)" }}>•</span>&nbsp;Case {testCase}
            </Button>
          ))}
        </div>
        <Button size="compact-md" classNames={{ root: classes.RunButton }}>
          Run
        </Button>
      </div>
    </>
  );
}
