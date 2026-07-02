import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a stylized card container for grouping related content.
 *
 * The component outputs a div with standardized card styling and a `data-slot="card"` attribute;
 * additional HTML attributes and `className` are forwarded to the div.
 *
 * @returns A div element serving as the card container with predefined styling and forwarded props.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the header region of a Card component.
 *
 * @returns A div element representing the card header with layout classes and `data-slot="card-header"`.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card title container with title-specific typography and a `data-slot="card-title"` attribute.
 *
 * @param className - Additional CSS classes to merge with the component's base title classes
 * @returns The card title `div` element
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's descriptive text area with muted styling and small text size.
 *
 * The element includes data-slot="card-description" for slot-based composition; additional `className` and other div props are forwarded.
 *
 * @returns The card description element.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's action slot positioned within the header grid.
 *
 * The returned element is a `div` with layout classes for grid placement and alignment, exposes
 * `data-slot="card-action"`, and merges any provided `className` and other `div` props.
 *
 * @returns The `div` element that serves as the card action slot.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card's content container.
 *
 * @returns A div element serving as the card's content slot with horizontal padding; accepts a `className` and forwards all other props to the element.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders the footer region of a Card with horizontal padding and top spacing when a border is present.
 *
 * @param className - Additional CSS classes to merge with the footer's default layout and spacing classes
 * @returns A `div` element used as the card footer, with `data-slot="card-footer"` and composed classes
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}