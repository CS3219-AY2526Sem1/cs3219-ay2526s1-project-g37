import { Group, Pill, Text, TypographyStylesProvider } from '@mantine/core';
import { DIFFICULTYCOLOR } from '~/constants/constants';

export default function HtmlRender(props: { name: string; topic: string; difficulty: string; description: string }) {
    return (
        <>
        <Text size="xl" fw={700}>
            {props.name}
        </Text>
        <Group mb="md" mt="md" gap={8}>
            {props.topic && <Pill>{props.topic}</Pill>}
        </Group>
        <Text
            size="md"
            fw={500}
            c={props.difficulty ? DIFFICULTYCOLOR[props.difficulty] : undefined}
            mb="md"
        >
            {props.difficulty}
        </Text>
        {/* html from markdown is purified using DOMPurify to sanitise xss and other injections */}
        <TypographyStylesProvider>
            <div
            dangerouslySetInnerHTML={{ __html: props.description }}
            />
        </TypographyStylesProvider>
        </>
    )
}