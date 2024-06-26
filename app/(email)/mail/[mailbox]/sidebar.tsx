import { Button } from "@/components/ui/button";
import { db, Email } from "@/db";
import { FileIcon, InboxIcon, PenSquareIcon, SendIcon, ShieldAlertIcon, StarIcon, Trash2Icon, SettingsIcon, TimerIcon } from "lucide-react";
import Link from "next/link";
import { SidebarLink } from "./sidebar.client";
import { Suspense, cache } from "react";
import { cn } from "@/utils/tw";
import { getCurrentUser } from "@/utils/jwt";
import { userMailboxAccess } from "./tools";
import { and, count, eq } from "drizzle-orm";

export const Sidebar = cache(({ mailbox: mailboxId, className }: { mailbox: string, className?: string }) => {

    const items = [
        {
            name: "Inbox",
            icon: InboxIcon,
            href: `/mail/${mailboxId}`
        },
        {
            name: "Draft",
            icon: FileIcon,
            href: `/mail/${mailboxId}/drafts`
        },
        {
            name: "Starred",
            icon: StarIcon,
            href: `/mail/${mailboxId}/starred`
        },
        {
            name: "Sent",
            icon: SendIcon,
            href: `/mail/${mailboxId}/sent`
        },
        {
            name: "Trash",
            icon: Trash2Icon,
            href: `/mail/${mailboxId}/trash`
        },
        {
            name: "Temporary Mail",
            icon: TimerIcon,
            href: `/mail/${mailboxId}/temp`,
        },
        {
            name: "Spam",
            icon: ShieldAlertIcon,
            href: `/mail/${mailboxId}/#spam`,
            disabled: true
        },
    ]

    return (
        <div className={cn("sm:min-h-screen sm:bg-tertiary text-tertiary-foreground lg:w-60 sm:p-3 sm:flex-shrink-0 inline overflow-y-auto", className)}>

            <br className="sm:hidden" />

            <Button asChild variant="secondary" className="rounded w-full gap-2 p-6 px-4 lg:px-6 font-bold my-3">
                <Link href={`/mail/${mailboxId}/draft/new`}>
                    <PenSquareIcon className="h-5 w-5" />
                    <span className="sm:max-lg:hidden">New Message</span>
                </Link>
            </Button>

            <br className="h-4" />

            <div className="flex flex-col gap-2 py-2 text-sm">
                {items.map(item => (<LinkElement key={item.href} {...item} />))}

                <hr className="bg-border w-full" />
                <LinkElement
                    name="Mailbox Config"
                    icon={SettingsIcon}
                    href={`/mail/${mailboxId}/config`}
                />
            </div>
        </div>
    )

})

export default Sidebar;

function LinkElement({ href, name, icon: Icon, disabled, className }: { href: string, name: string, icon: any, disabled?: boolean, className?: string }) {
    return (
        <Button asChild variant="ghost" className={cn("flex py-6 px-3 gap-4 hover:text-foreground font-bold transition-colors justify-normal sm:self-center w-full lg:self-auto", className)}>
            <SidebarLink href={href} className="" disabled={disabled}>
                <Icon className="h-6 w-6" />
                <span className="self-center sm:max-lg:hidden">{name}</span>
                {(name === "Inbox") && (
                    <Suspense>
                        <UnreadEmailsCount mailboxId={href.split("/")[2]} />
                    </Suspense>
                )}
            </SidebarLink>
        </Button>
    )
}

const getUnreadEmailsCount = cache(async (mailboxId: string) => {
    const userId = await getCurrentUser()
    if (!await userMailboxAccess(mailboxId, userId)) return []

    const unreadEmails = await db
        .select({ count: count() })
        .from(Email)
        .where(and(
            eq(Email.mailboxId, mailboxId),
            eq(Email.isRead, false)
        ))
        .execute()

    return unreadEmails[0].count
})

async function UnreadEmailsCount({ mailboxId }: { mailboxId: string }) {
    const unreadEmails = await getUnreadEmailsCount(mailboxId)
    if (unreadEmails === 0 || !unreadEmails) {
        return <></>
    }

    return (
        <span className="bg-blue text-blue-foreground rounded font-bold px-3 py-1 text-xs ms-auto float-right self-center select-none sm:max-lg:hidden">
            {unreadEmails}
        </span>
    )

}
