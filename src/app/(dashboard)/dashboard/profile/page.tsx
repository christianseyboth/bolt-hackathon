import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DeleteAccountSection } from '@/components/dashboard/delete-account-section';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ProfilePage() {
    const user = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
    };

    return (
        <>
            <DashboardHeader
                heading='Profile'
                subheading='Manage your Profile settings'
                user={{
                    name: undefined,
                    avatar_url: undefined,
                    email: undefined,
                }}
            />
            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card className='border border-neutral-800 bg-neutral-900  mt-8'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className='space-y-6'>
                            <div className='flex items-center space-x-4'>
                                <Avatar>
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <Button variant='outline' size='sm'>
                                    Change Avatar
                                </Button>
                            </div>
                            <div>
                                <label className='block text-sm mb-1'>Name</label>
                                <Input defaultValue={user.name} name='name' />
                            </div>
                            <div>
                                <label className='block text-sm mb-1'>Email</label>
                                <Input value={user.email} disabled />
                            </div>
                            {/* Weitere Felder optional */}
                            <Button type='submit' className='w-full'>
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card className='border border-neutral-800 bg-neutral-900  mt-8'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Language</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className='block mb-1'>Language</Label>
                            <Select>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Theme' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='light'>English</SelectItem>
                                    <SelectItem value='dark'>German</SelectItem>
                                    <SelectItem value='system'>System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Timezone */}
                        <div>
                            <Label className='block mb-1'>Timezone</Label>
                            <Select>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Theme' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='light'>English</SelectItem>
                                    <SelectItem value='dark'>German</SelectItem>
                                    <SelectItem value='system'>System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type='submit' className='w-full'>
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <DeleteAccountSection />
            </div>
        </>
    );
}
