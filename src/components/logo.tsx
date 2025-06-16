
import { Link } from 'next-view-transitions';
import React from 'react';

const SvgComponent = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width={25}
        height={25}
        viewBox='0 0 45.75 45.75'
        className='rounded-full'
        {...props}
    >
        <defs>
            <clipPath id='a'>
                <path d='M0 0h45.5v45.5H0Zm0 0' />
            </clipPath>
            <clipPath id='b'>
                <path d='M0 0h45.5v45.5H0Zm0 0' />
            </clipPath>
            <clipPath id='c'>
                <path d='M22.75 0C35.313 0 45.5 10.184 45.5 22.75c0 12.563-10.188 22.75-22.75 22.75C10.184 45.5 0 35.312 0 22.75 0 10.184 10.184 0 22.75 0Zm0 0' />
            </clipPath>
            <clipPath id='d'>
                <path d='M8 4.121h23V33H8Zm0 0' />
            </clipPath>
            <clipPath id='e'>
                <path d='M15 13h23v28.418H15Zm0 0' />
            </clipPath>
        </defs>
        <g clipPath='url(#a)'>
            <path
                d='M0 0h45.5v45.5H0Zm0 0'
                style={{
                    stroke: 'none',
                    fillRule: 'nonzero',
                    fill: '#fff',
                    fillOpacity: 1,
                }}
            />
        </g>
        <g clipPath='url(#b)'>
            <g clipPath='url(#c)'>
                <path
                    d='M0 0h45.5v45.5H0Zm0 0'
                    style={{
                        stroke: 'none',
                        fillRule: 'nonzero',
                        fill: '#fff',
                        fillOpacity: 1,
                    }}
                />
            </g>
        </g>
        <g clipPath='url(#d)'>
            <path
                d='M29.23 25.113c1.06-1.082 1.223-2.316.09-3.465-1.191-1.21-2.465-1.07-3.64.04-1.2 1.132-2.336 2.335-3.512 3.496-2.43 2.386-5.379 2.582-7.496.511-2.18-2.129-2.02-5.16.433-7.648 2.032-2.059 4.133-4.05 6.122-6.149 2.468-2.609 2.785-5.418.93-7.75l-11.821 11.82c-3.305 3.575-2.824 9.575.726 13.15 3.563 3.589 9.403 4.046 13.149.898 1.785-1.504 3.39-3.227 5.02-4.903Zm0 0'
                style={{
                    stroke: 'none',
                    fillRule: 'nonzero',
                    fill: '#2a39c0',
                    fillOpacity: 1,
                }}
            />
        </g>
        <g clipPath='url(#e)'>
            <path
                d='M34.332 16.266c-3.562-3.586-9.402-4.047-13.148-.899-1.786 1.504-3.391 3.227-5.02 4.903-1.059 1.082-1.223 2.316-.09 3.464 1.196 1.211 2.465 1.07 3.64-.039 1.2-1.133 2.337-2.336 3.513-3.492 2.43-2.387 5.378-2.586 7.496-.515 2.18 2.128 2.02 5.16-.438 7.648-2.027 2.062-4.129 4.05-6.117 6.148-2.469 2.61-2.785 5.422-.93 7.75l11.82-11.816c3.305-3.578 2.825-9.578-.726-13.152Zm0 0'
                style={{
                    stroke: 'none',
                    fillRule: 'nonzero',
                    fill: '#000',
                    fillOpacity: 1,
                }}
            />
        </g>
    </svg>
);

export const Logo = () => {
    return (
        <Link
            href='/'
            className='font-normal flex space-x-2 items-center text-sm mr-4  text-black px-2 py-1  relative z-20 rounded-full'
        >
            <SvgComponent />

            <span className='text-white font-bold text-lg'>SecPilot</span>
        </Link>
    );
};

