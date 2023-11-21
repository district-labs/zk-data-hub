interface PoolPageProps {
   params: { address: string }

}

export default function PoolPage({ params }:PoolPageProps){
  return <div>Pool Page: {params.address}</div>
}